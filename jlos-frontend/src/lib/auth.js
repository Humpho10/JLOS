// ============================================================
// Thin client for the account endpoints (register/login/logout).
// Kept separate from api.js so both files can share the auth
// token module without a circular import.
// ============================================================

import { API_URL, ApiError } from './api.js';
import { getGuestToken } from './guestToken.js';
import { getAuthToken, setAuthToken } from './authToken.js';

async function authRequest(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ ...body, guest_token: getGuestToken() }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || Object.values(data?.errors || {})[0]?.[0] || 'Something went wrong.';
    throw new ApiError(message, res.status);
  }

  return data;
}

export async function register({ name, email, password, passwordConfirmation }) {
  const data = await authRequest('/api/register', {
    name,
    email,
    password,
    password_confirmation: passwordConfirmation,
  });
  setAuthToken(data.token);
  return data.user;
}

export async function login({ email, password }) {
  const data = await authRequest('/api/login', { email, password });
  setAuthToken(data.token);
  return data.user;
}

export async function logout() {
  const token = getAuthToken();
  if (token) {
    await fetch(`${API_URL}/api/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    }).catch(() => {});
  }
  setAuthToken(null);
}

// Silent by design — called on every page load to check for an existing
// session, so a missing/expired token should just mean "signed out", not
// surface an error toast.
export async function fetchMe() {
  const token = getAuthToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/api/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });

  if (!res.ok) {
    setAuthToken(null);
    return null;
  }

  return (await res.json()).user;
}

export async function resendVerification() {
  const res = await fetch(`${API_URL}/api/email/verification-notification`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getAuthToken()}`, Accept: 'application/json' },
  });
  if (!res.ok) throw new ApiError('Could not resend the verification email.', res.status);
  return res.json();
}
