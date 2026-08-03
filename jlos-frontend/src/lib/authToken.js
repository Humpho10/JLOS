const KEY = 'jlos_auth_token';

export function getAuthToken() {
  return localStorage.getItem(KEY);
}

export function setAuthToken(token) {
  if (token) localStorage.setItem(KEY, token);
  else localStorage.removeItem(KEY);
}
