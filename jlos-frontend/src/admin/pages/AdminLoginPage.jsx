import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuthContext.jsx';
import Spinner from '../components/Spinner.jsx';

export default function AdminLoginPage() {
  const { token, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (token) {
    return <Navigate to={location.state?.from || '/admin'} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not sign in.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-shell flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-brand-line bg-brand-card p-8 shadow-xl shadow-brand-navy/5">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-lg text-white">
            ⚖️
          </div>
          <div>
            <h1 className="text-lg font-semibold text-brand-navy">Admin sign in</h1>
            <p className="text-sm text-brand-muted">Institution &amp; super admin access</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-lg border border-brand-danger/20 bg-brand-danger-bg px-3 py-2 text-sm text-brand-danger">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-brand-muted">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-brand-line bg-brand-bg px-3 py-2.5 text-sm text-brand-text outline-none transition focus:border-brand-navy-3 focus:ring-2 focus:ring-brand-navy-3/20"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-brand-muted">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-brand-line bg-brand-bg px-3 py-2.5 text-sm text-brand-text outline-none transition focus:border-brand-navy-3 focus:ring-2 focus:ring-brand-navy-3/20"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-brand-navy-3 to-brand-navy px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Spinner />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
