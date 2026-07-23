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

// Institution-agnostic chat — searches content across every institution
// and answers based on whichever one the question is actually about.
export function sendMessageStream(message, callbacks) {
  return streamChat('/api/chat/stream', message, callbacks);
}

// Scoped to a single institution's own content (its slug in the backend).
export function sendInstitutionMessageStream(slug, message, callbacks) {
  return streamChat(`/api/institutions/${slug}/chat/stream`, message, callbacks);
}
