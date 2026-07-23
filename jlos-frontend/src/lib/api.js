// ============================================================
// Thin client for the jlos-chatbot Laravel API.
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
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
async function streamChat(path, message, { onDelta, onError }) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({ message }),
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

      if (payload.type === 'delta') onDelta(payload.text);
      else if (payload.type === 'error') onError(payload.message);
      else if (payload.type === 'done') return;
    }
  }
}

// Streams a reply from the general, institution-agnostic chat endpoint.
// Returns a promise so callers can .catch()/.finally() around the whole
// exchange, while onDelta/onError report progress as it happens.
export function sendMessageStream(message, { onDelta, onError }) {
  return streamChat('/api/chat/stream', message, { onDelta, onError });
}

// Reads an attached image/PDF and returns a short description of it — the
// caller drops that into the chat input the same way it does a voice
// transcript, before it goes through the normal search-and-answer flow.
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

  if (!res.ok || !data?.description) {
    throw new ApiError(data?.error || 'Could not read that file. Please try again.', res.status);
  }

  return data.description;
}