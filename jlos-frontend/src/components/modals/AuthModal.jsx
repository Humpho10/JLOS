import React, { useState } from 'react';
import ModalShell from './ModalShell.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { ApiError } from '../../lib/api.js';

const EMPTY_FORM = { name: '', email: '', password: '', passwordConfirmation: '' };

export default function AuthModal() {
  const { closeModal, handleLogin, handleRegister } = useApp();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const field = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const switchMode = (next) => {
    setMode(next);
    setError(null);
    setForm(EMPTY_FORM);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        await handleLogin({ email: form.email, password: form.password });
      } else {
        await handleRegister(form);
      }
      closeModal('authModal');
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell id="authModal" title={mode === 'login' ? 'Sign in' : 'Create an account'}>
      <div className="auth-tabs" role="tablist" aria-label="Sign in or create an account">
        <button type="button" role="tab" aria-selected={mode === 'login'} className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>
          Sign in
        </button>
        <button type="button" role="tab" aria-selected={mode === 'register'} className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => switchMode('register')}>
          Create account
        </button>
      </div>

      <form className="auth-form" onSubmit={submit}>
        {mode === 'register' && (
          <label className="auth-field">
            <span>Name</span>
            <input type="text" required value={form.name} onChange={field('name')} autoComplete="name" />
          </label>
        )}
        <label className="auth-field">
          <span>Email</span>
          <input type="email" required value={form.email} onChange={field('email')} autoComplete="email" />
        </label>
        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            required
            minLength={mode === 'register' ? 8 : undefined}
            value={form.password}
            onChange={field('password')}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>
        {mode === 'register' && (
          <label className="auth-field">
            <span>Confirm password</span>
            <input type="password" required value={form.passwordConfirmation} onChange={field('passwordConfirmation')} autoComplete="new-password" />
          </label>
        )}

        {error && <p className="auth-error" role="alert">{error}</p>}

        <button type="submit" className="mc-btn primary auth-submit" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>
      </form>
    </ModalShell>
  );
}
