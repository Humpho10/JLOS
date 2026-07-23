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

export async function sendInstitutionMessage(slug, message) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/institutions/${slug}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ message }),
    });
  } catch {
    throw new ApiError(
      "Can't reach the assistant right now — check that the API server is running.",
      0
    );
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.reply || 'Something went wrong. Please try again.', res.status);
  }

  return data.reply;
}

// Institution-agnostic chat — searches content across every institution
// and answers based on whichever one the question is actually about.
export async function sendMessage(message) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ message }),
    });
  } catch {
    throw new ApiError(
      "Can't reach the assistant right now — check that the API server is running.",
      0
    );
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(data?.reply || 'Something went wrong. Please try again.', res.status);
  }

  return data.reply;
}

// Streaming variant of sendMessage() — reads the reply as Server-Sent
// Events and reports each text chunk as it arrives via onDelta, instead of
// waiting for the whole reply before returning anything.
export async function sendMessageStream(message, { onDelta, onError }) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/chat/stream`, {
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
