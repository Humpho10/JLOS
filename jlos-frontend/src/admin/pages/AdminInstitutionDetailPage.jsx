import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAdminAuth } from '../AdminAuthContext.jsx';
import {
  createInstitutionPage,
  deleteInstitutionPage,
  fetchAdminInstitutions,
  fetchInstitutionSyncStatus,
  triggerInstitutionSync,
} from '../api.js';
import Badge from '../components/Badge.jsx';
import Spinner from '../components/Spinner.jsx';

const POLL_MS = 3000;

export default function AdminInstitutionDetailPage() {
  const { id } = useParams();
  const { token } = useAdminAuth();
  const [institution, setInstitution] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [newPage, setNewPage] = useState({ label: '', path: '' });
  const [adding, setAdding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const pollRef = useRef(null);

  const loadInstitution = useCallback(() => {
    fetchAdminInstitutions(token)
      .then((list) => setInstitution(list.find((i) => String(i.id) === id) || null))
      .catch((err) => setError(err.message || 'Could not load institution.'));
  }, [token, id]);

  const loadStatus = useCallback(() => {
    fetchInstitutionSyncStatus(token, id)
      .then(setStatus)
      .catch((err) => setError(err.message || 'Could not load sync status.'));
  }, [token, id]);

  useEffect(() => {
    loadInstitution();
    loadStatus();
  }, [loadInstitution, loadStatus]);

  // Poll while a sync is actively running so the status panel updates
  // without the admin having to refresh the page.
  useEffect(() => {
    const active = status && ['scraping', 'embedding'].includes(status.sync_status);

    if (active) {
      pollRef.current = setInterval(loadStatus, POLL_MS);
    }

    return () => clearInterval(pollRef.current);
  }, [status, loadStatus]);

  async function handleAddPage(e) {
    e.preventDefault();
    setAdding(true);
    setError('');
    try {
      await createInstitutionPage(token, id, newPage);
      setNewPage({ label: '', path: '' });
      loadStatus();
    } catch (err) {
      setError(err.message || 'Could not add page.');
    } finally {
      setAdding(false);
    }
  }

  async function handleDeletePage(pageId) {
    setRemovingId(pageId);
    try {
      await deleteInstitutionPage(token, id, pageId);
      loadStatus();
    } catch (err) {
      setError(err.message || 'Could not remove page.');
    } finally {
      setRemovingId(null);
    }
  }

  async function handleSync() {
    setSyncing(true);
    setError('');
    try {
      await triggerInstitutionSync(token, id);
      // Optimistically flip to "scraping" so the poll effect starts right
      // away — the queue worker may not have picked the job up yet, so an
      // immediate loadStatus() here could still read the old "idle" status
      // and never start polling.
      setStatus((prev) => (prev ? { ...prev, sync_status: 'scraping' } : prev));
      loadStatus();
    } catch (err) {
      setError(err.message || 'Could not start sync.');
    } finally {
      setSyncing(false);
    }
  }

  if (!institution) {
    return (
      <div className="flex items-center gap-2 text-brand-muted">
        <Spinner />
        Loading…
      </div>
    );
  }

  const isRunning = ['scraping', 'embedding'].includes(status?.sync_status);
  const canSync = status?.pages?.length > 0 && !isRunning;

  return (
    <div>
      <Link to="/admin/institutions" className="mb-4 inline-flex items-center gap-1 text-sm text-brand-muted transition hover:text-brand-navy">
        ← Institutions
      </Link>
      <h2 className="mb-1 text-2xl font-semibold text-brand-navy">{institution.name}</h2>
      <p className="mb-6 text-sm text-brand-muted">
        {institution.slug} · {institution.base_url}
      </p>

      {error && (
        <div className="mb-5 rounded-lg border border-brand-danger/20 bg-brand-danger-bg px-3 py-2 text-sm text-brand-danger">
          {error}
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-brand-line bg-brand-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-brand-text">Knowledge base sync</h3>
            <div className="mt-2 flex items-center gap-2">
              <Badge status={status?.sync_status || 'idle'} />
              {status?.last_synced_at && (
                <span className="text-xs text-brand-muted">
                  last synced {new Date(status.last_synced_at).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={!canSync || syncing}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-brand-navy-3 to-brand-navy px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {(syncing || isRunning) && <Spinner />}
            {isRunning ? 'Syncing…' : syncing ? 'Starting…' : 'Sync knowledge base'}
          </button>
        </div>
        {status?.last_sync_error && (
          <div className="rounded-lg border border-brand-danger/20 bg-brand-danger-bg px-3 py-2 text-sm text-brand-danger">
            {status.last_sync_error}
          </div>
        )}
      </div>

      <div className="mb-6 rounded-2xl border border-brand-line bg-brand-card p-6">
        <h3 className="mb-4 font-semibold text-brand-text">Add a page</h3>
        <form onSubmit={handleAddPage} className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label htmlFor="page-label" className="mb-1.5 block text-sm font-medium text-brand-muted">Label</label>
            <input
              id="page-label"
              value={newPage.label}
              onChange={(e) => setNewPage((p) => ({ ...p, label: e.target.value }))}
              placeholder="e.g. leadership"
              required
              className="w-full rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm outline-none transition focus:border-brand-navy-3 focus:ring-2 focus:ring-brand-navy-3/20"
            />
          </div>
          <div>
            <label htmlFor="page-path" className="mb-1.5 block text-sm font-medium text-brand-muted">Path</label>
            <input
              id="page-path"
              value={newPage.path}
              onChange={(e) => setNewPage((p) => ({ ...p, path: e.target.value }))}
              placeholder="/team"
              required
              className="w-full rounded-lg border border-brand-line bg-brand-bg px-3 py-2 text-sm outline-none transition focus:border-brand-navy-3 focus:ring-2 focus:ring-brand-navy-3/20"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-navy px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {adding && <Spinner />}
            {adding ? 'Adding…' : 'Add page'}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-brand-line bg-brand-card p-6">
        <h3 className="mb-4 font-semibold text-brand-text">Pages ({status?.pages?.length ?? 0})</h3>
        {!status?.pages?.length ? (
          <p className="text-sm text-brand-muted">No pages configured yet — add one above before syncing.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-brand-line text-left text-xs uppercase tracking-wide text-brand-muted">
                  <th className="py-2 pr-4 font-medium">Label</th>
                  <th className="py-2 pr-4 font-medium">Path</th>
                  <th className="py-2 pr-4 font-medium">Last status</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {status.pages.map((p) => (
                  <tr key={p.id} className="border-b border-brand-line last:border-0 hover:bg-black/[0.02]">
                    <td className="py-3 pr-4 font-medium text-brand-text">{p.label}</td>
                    <td className="py-3 pr-4 text-brand-muted">{p.path}</td>
                    <td className="py-3 pr-4">
                      <Badge status={p.last_status || 'never_synced'} />
                      {p.last_error && <div className="mt-1 text-xs text-brand-danger">{p.last_error}</div>}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeletePage(p.id)}
                        disabled={removingId === p.id}
                        className="rounded-lg border border-brand-line px-3 py-1 text-xs text-brand-muted transition hover:border-brand-danger/40 hover:text-brand-danger disabled:opacity-50"
                      >
                        {removingId === p.id ? '…' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
