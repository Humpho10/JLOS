// ============================================================
// Thin client for the jlos-chatbot Laravel API.
// ============================================================

import { getAuthToken } from './authToken.js';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Attaches a Bearer token when the visitor is signed in, so a request made
// through the same endpoints a guest uses gets resolved against their
// account instead of a guest_token.
function authHeaders(extra = {}) {
  const token = getAuthToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

export async function fetchInstitutions() {
  const res = await fetch(`${API_URL}/api/institutions`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new ApiError('Could not load institutions.', res.status);
  return res.json();
}

// Reads a chat reply as Server-Sent Events, reporting each text chunk as it
// arrives via onDelta instead of waiting for the whole reply before
// returning anything. Shared by the general and institution-scoped chats —
// they only differ in which endpoint they stream from.
//
// `conversationId`/`guestToken` let the backend attach this exchange to a
// persisted conversation; `onConversationId` reports the ID the backend is
// using (a brand-new conversation's ID arrives this way, before any text).
async function streamChat(path, message, { conversationId, guestToken, onDelta, onError, onConversationId }) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json', Accept: 'text/event-stream' }),
      body: JSON.stringify({ message, conversation_id: conversationId, guest_token: guestToken }),
    });
  } catch {
    onError("Can't reach the assistant right now — check that the API server is running.");
    return;
  }

  if (!res.ok || !res.body) {
    onError('Something went wrong. Please try again.');
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) return;

    buffer += decoder.decode(value, { stream: true });

    let sepIndex;
    while ((sepIndex = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, sepIndex);
      buffer = buffer.slice(sepIndex + 2);

      const dataLine = frame.split('\n').find((line) => line.startsWith('data: '));
      if (!dataLine) continue;

      let payload;
      try {
        payload = JSON.parse(dataLine.slice(6));
      } catch {
        continue;
      }

      if (payload.type === 'conversation') onConversationId?.(payload.id);
      else if (payload.type === 'delta') onDelta(payload.text);
      else if (payload.type === 'error') onError(payload.message);
      else if (payload.type === 'done') return;
    }
  }
}

// Streams a reply from the general, institution-agnostic chat endpoint.
// Returns a promise so callers can .catch()/.finally() around the whole
// exchange, while onDelta/onError report progress as it happens.
export function sendMessageStream(message, { conversationId, guestToken, onDelta, onError, onConversationId }) {
  return streamChat('/api/chat/stream', message, { conversationId, guestToken, onDelta, onError, onConversationId });
}

// The guest's most recent persisted conversation (if any), so the frontend
// can rebuild the chat on page load instead of always starting fresh.
export async function fetchCurrentConversation(guestToken) {
  const res = await fetch(`${API_URL}/api/conversations/current?guest_token=${encodeURIComponent(guestToken)}`, {
    headers: authHeaders({ Accept: 'application/json' }),
  });
  if (!res.ok) throw new ApiError('Could not load conversation history.', res.status);
  return res.json();
}

// Drops every message in a conversation from `sinceIso` onward — backs the
// "edit a past question" flow, which needs the AI's memory of the old
// question/answer erased, not just hidden in the UI.
export async function truncateConversation(conversationId, sinceIso, guestToken) {
  const res = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
    method: 'DELETE',
    headers: authHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
    body: JSON.stringify({ since: sinceIso, guest_token: guestToken }),
  });
  if (!res.ok) throw new ApiError('Could not update the conversation.', res.status);
  return res.json();
}

// Reads an attached image/PDF's real content (extracted text for a PDF, an
// AI-generated description for an image) — the caller feeds that to the AI
// as grounding context alongside whatever the user typed, rather than
// showing it as if the user had said it themselves.
export async function interpretAttachment(file) {
  const form = new FormData();
  form.append('attachment', file);

  let res;
  try {
    res = await fetch(`${API_URL}/api/chat/interpret-attachment`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: form,
    });
  } catch {
    throw new ApiError(
      "Can't reach the assistant right now — check that the API server is running.",
      0
    );
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.content) {
    throw new ApiError(data?.error || 'Could not read that file. Please try again.', res.status);
  }

  return data.content;
}

// ============================================================
// Admin — institution management. Every call here requires an
// admin-role Bearer token; the backend's `admin` middleware
// rejects anyone else with a 403 regardless of what the frontend
// does, so these functions rely on authHeaders() the same way
// the rest of this file does.
// ============================================================

async function adminRequest(path, options = {}) {
  const res = await fetch(`${API_URL}/api/admin${path}`, {
    ...options,
    headers: authHeaders({ 'Content-Type': 'application/json', Accept: 'application/json', ...options.headers }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || Object.values(data?.errors || {})[0]?.[0] || 'Something went wrong.';
    throw new ApiError(message, res.status);
  }

  return data;
}

export function fetchAdminInstitutions() {
  return adminRequest('/institutions');
}

export function createAdminInstitution(payload) {
  return adminRequest('/institutions', { method: 'POST', body: JSON.stringify(payload) });
}

export function updateAdminInstitution(id, payload) {
  return adminRequest(`/institutions/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deleteAdminInstitution(id) {
  return adminRequest(`/institutions/${id}`, { method: 'DELETE' });
}

export function fetchAdminInstitutionPages(institutionId) {
  return adminRequest(`/institutions/${institutionId}/pages`);
}

export function createAdminInstitutionPage(institutionId, payload) {
  return adminRequest(`/institutions/${institutionId}/pages`, { method: 'POST', body: JSON.stringify(payload) });
}

export function updateAdminInstitutionPage(institutionId, pageId, payload) {
  return adminRequest(`/institutions/${institutionId}/pages/${pageId}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deleteAdminInstitutionPage(institutionId, pageId) {
  return adminRequest(`/institutions/${institutionId}/pages/${pageId}`, { method: 'DELETE' });
}

// Queues a background scrape + embed run for this institution; the backend
// responds immediately with the queued run record, then does the actual
// work asynchronously — callers should poll fetchLatestScrapeRun().
export function triggerAdminScrape(institutionId) {
  return adminRequest(`/institutions/${institutionId}/scrape`, { method: 'POST' });
}

export function fetchLatestScrapeRun(institutionId) {
  return adminRequest(`/institutions/${institutionId}/scrape-runs/latest`);
}