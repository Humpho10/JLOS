import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuthContext.jsx';
import { createInstitution, fetchAdminInstitutions } from '../api.js';
import Spinner from '../components/Spinner.jsx';

const emptyForm = { name: '', slug: '', base_url: '' };

export default function AdminInstitutionsPage() {
  const { token } = useAdminAuth();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function load() {
    setLoading(true);
    fetchAdminInstitutions(token)
      .then(setInstitutions)
      .catch((err) => setError(err.message || 'Could not load institutions.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const created = await createInstitution(token, form);
      setInstitutions((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Could not create institution.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="mb-1 text-2xl font-semibold text-brand-navy">Institutions</h2>
          <p className="text-sm text-brand-muted">Manage institutions and their knowledge base.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-brand-navy-3 to-brand-navy px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          {showForm ? 'Cancel' : '+ Add institution'}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-brand-danger/20 bg-brand-danger-bg px-3 py-2 text-sm text-brand-danger">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-2xl border border-brand-line bg-brand-card p-6">
          <h3 className="mb-4 font-semibold text-brand-text">New institution</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="inst-name" className="mb-1.5 block text-sm font-medium text-brand-muted">Name</label>
              <input
                id="inst-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="w-full rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm outline-none transition focus:border-brand-navy-3 focus:ring-2 focus:ring-brand-navy-3/20"
              />
            </div>
            <div>
              <label htmlFor="inst-slug" className="mb-1.5 block text-sm font-medium text-brand-muted">Slug</label>
              <input
                id="inst-slug"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="e.g. tat"
                required
                className="w-full rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm outline-none transition focus:border-brand-navy-3 focus:ring-2 focus:ring-brand-navy-3/20"
              />
            </div>
            <div>
              <label htmlFor="inst-url" className="mb-1.5 block text-sm font-medium text-brand-muted">Base URL</label>
              <input
                id="inst-url"
                type="url"
                value={form.base_url}
                onChange={(e) => setForm((f) => ({ ...f, base_url: e.target.value }))}
                placeholder="https://example.go.ug"
                required
                className="w-full rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm outline-none transition focus:border-brand-navy-3 focus:ring-2 focus:ring-brand-navy-3/20"
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-brand-navy-3 to-brand-navy px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating && <Spinner />}
                {creating ? 'Adding…' : 'Add institution'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-brand-muted">
          <Spinner />
          Loading…
        </div>
      ) : institutions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-line bg-brand-card p-10 text-center text-brand-muted">
          No institutions yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {institutions.map((inst) => (
            <Link
              key={inst.id}
              to={`/admin/institutions/${inst.id}`}
              className="group rounded-2xl border border-brand-line bg-brand-card p-5 transition hover:-translate-y-0.5 hover:border-brand-navy-3/50 hover:shadow-lg hover:shadow-brand-navy/10"
            >
              <div className="mb-1 flex items-center justify-between">
                <h3 className="font-semibold text-brand-text group-hover:text-brand-navy">{inst.name}</h3>
                <span className="text-brand-muted transition group-hover:translate-x-0.5 group-hover:text-brand-navy">→</span>
              </div>
              <p className="mb-2 inline-block rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-brand-muted">
                {inst.slug}
              </p>
              <p className="truncate text-sm text-brand-muted">{inst.base_url}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
