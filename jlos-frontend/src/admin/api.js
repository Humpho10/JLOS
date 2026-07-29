// ============================================================
// Thin client for the jlos-chatbot Laravel API's /api/admin/* routes.
// Every admin endpoint requires a Bearer token, added here so callers
// don't have to repeat header/error handling.
// ============================================================

import { API_URL, ApiError } from '../lib/api.js';

export async function adminRequest(path, { method = 'GET', token, body } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the admin API right now.", 0);
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
    throw new ApiError(firstError || data?.message || 'Something went wrong.', res.status);
  }

  return data;
}

export function adminLogin(email, password) {
  return adminRequest('/api/admin/login', { method: 'POST', body: { email, password } });
}

export function adminLogout(token) {
  return adminRequest('/api/admin/logout', { method: 'POST', token });
}

export function adminMe(token) {
  return adminRequest('/api/admin/me', { token });
}

export function fetchMessages(token, { institutionId } = {}) {
  const query = institutionId ? `?institution_id=${institutionId}` : '';
  return adminRequest(`/api/admin/messages${query}`, { token });
}

export function replyToMessage(token, messageId, replyBody) {
  return adminRequest(`/api/admin/messages/${messageId}/reply`, {
    method: 'POST',
    token,
    body: { reply_body: replyBody },
  });
}

export function fetchAdminInstitutions(token) {
  return adminRequest('/api/admin/institutions', { token });
}

export function createInstitution(token, { name, slug, base_url }) {
  return adminRequest('/api/admin/institutions', {
    method: 'POST',
    token,
    body: { name, slug, base_url },
  });
}

export function updateInstitution(token, id, data) {
  return adminRequest(`/api/admin/institutions/${id}`, {
    method: 'PUT',
    token,
    body: data,
  });
}

export function fetchInstitutionPages(token, institutionId) {
  return adminRequest(`/api/admin/institutions/${institutionId}/pages`, { token });
}

export function createInstitutionPage(token, institutionId, { label, path }) {
  return adminRequest(`/api/admin/institutions/${institutionId}/pages`, {
    method: 'POST',
    token,
    body: { label, path },
  });
}

export function deleteInstitutionPage(token, institutionId, pageId) {
  return adminRequest(`/api/admin/institutions/${institutionId}/pages/${pageId}`, {
    method: 'DELETE',
    token,
  });
}

export function triggerInstitutionSync(token, institutionId) {
  return adminRequest(`/api/admin/institutions/${institutionId}/sync`, {
    method: 'POST',
    token,
  });
}

export function fetchInstitutionSyncStatus(token, institutionId) {
  return adminRequest(`/api/admin/institutions/${institutionId}/sync-status`, { token });
}
