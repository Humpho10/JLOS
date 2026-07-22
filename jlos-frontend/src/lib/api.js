// ============================================================
// Thin client for the jlos-chatbot Laravel API. Only the DPP
// institution has scraped/embedded content in this prototype,
// but these calls work for any institution slug the backend has.
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
