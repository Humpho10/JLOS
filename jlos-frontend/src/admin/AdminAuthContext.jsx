import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { adminLogin, adminLogout, adminMe } from './api.js';

const AdminAuthContext = createContext(null);

const STORAGE_KEY = 'jlos_admin_auth';

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStored);
  const [ready, setReady] = useState(false);

  // On mount, re-validate any stored token against the API rather than
  // trusting stale localStorage — the token may have been revoked/expired.
  useEffect(() => {
    const stored = loadStored();
    if (!stored?.token) {
      setReady(true);
      return;
    }
    adminMe(stored.token)
      .then(({ user }) => setAuth({ token: stored.token, user }))
      .catch(() => setAuth(null))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    else localStorage.removeItem(STORAGE_KEY);
  }, [auth]);

  const login = useCallback(async (email, password) => {
    const { token, user } = await adminLogin(email, password);
    setAuth({ token, user });
    return user;
  }, []);

  const logout = useCallback(() => {
    if (auth?.token) adminLogout(auth.token).catch(() => {});
    setAuth(null);
  }, [auth]);

  return (
    <AdminAuthContext.Provider
      value={{ token: auth?.token ?? null, user: auth?.user ?? null, ready, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
