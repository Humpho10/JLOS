import React, { useCallback, useEffect, useState } from 'react';
import '../../resources/css/admin.css';
import { login, logout, fetchMe } from '../lib/auth.js';
import {
  fetchAdminInstitutions, createAdminInstitution, updateAdminInstitution, deleteAdminInstitution,
  fetchAdminInstitutionPages, createAdminInstitutionPage, updateAdminInstitutionPage, deleteAdminInstitutionPage,
  triggerAdminScrape, fetchLatestScrapeRun,
  ApiError,
} from '../lib/api.js';

const ICONS = ['scale', 'file', 'heart', 'briefcase', 'receipt', 'landmark', 'shield', 'lock'];

const EMPTY_FORM = {
  name: '', slug: '', base_url: '', code: '', short_name: '', sub_heading: '',
  color: '#0E2A47', icon: 'scale', phone: '', website: '', logo_url: '', services: [], status: 'draft',
};

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ---------- login ----------
function AdminLogin({ onSignedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login({ email, password });
      if (user.role !== 'admin') {
        await logout();
        setError('That account does not have admin access.');
        return;
      }
      onSignedIn(user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={submit}>
        <h1>JLOS Admin</h1>
        <p>Sign in with your admin account to manage institutions.</p>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-field">
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        </div>
        <div className="admin-field">
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="admin-btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}

// ---------- institution create/edit form ----------
function InstitutionForm({ institution, onClose, onSaved }) {
  const isEdit = !!institution;
  const [form, setForm] = useState(() => (institution ? { ...EMPTY_FORM, ...institution, services: institution.services || [] } : EMPTY_FORM));
  const [serviceDraft, setServiceDraft] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const next = { ...f, [key]: value };
      // Auto-fill the slug from the name until the admin edits it directly.
      if (key === 'name' && (!isEdit || f.slug === slugify(f.name))) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const addService = () => {
    const value = serviceDraft.trim();
    if (!value) return;
    setForm((f) => ({ ...f, services: [...f.services, value] }));
    setServiceDraft('');
  };

  const removeService = (i) => {
    setForm((f) => ({ ...f, services: f.services.filter((_, idx) => idx !== i) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isEdit) {
        await updateAdminInstitution(institution.id, form);
      } else {
        await createAdminInstitution(form);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="admin-modal" onSubmit={submit}>
        <h3>{isEdit ? `Edit ${institution.name}` : 'Add institution'}</h3>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-form-grid">
          <div className="admin-field full">
            <label>Name</label>
            <input required value={form.name} onChange={set('name')} />
          </div>
          <div className="admin-field">
            <label>Slug</label>
            <input required value={form.slug} onChange={set('slug')} />
          </div>
          <div className="admin-field">
            <label>Status</label>
            <select value={form.status} onChange={set('status')}>
              <option value="draft">Draft (hidden from public site)</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="admin-field full">
            <label>Base URL (the institution's own site, used for scraping)</label>
            <input required type="url" value={form.base_url} onChange={set('base_url')} placeholder="https://example.go.ug" />
          </div>
          <div className="admin-field">
            <label>Code (badge text)</label>
            <input value={form.code} onChange={set('code')} placeholder="e.g. UHRC" />
          </div>
          <div className="admin-field">
            <label>Short name</label>
            <input value={form.short_name} onChange={set('short_name')} />
          </div>
          <div className="admin-field full">
            <label>Sub-heading</label>
            <input value={form.sub_heading} onChange={set('sub_heading')} placeholder="e.g. Human rights protection" />
          </div>
          <div className="admin-field">
            <label>Color</label>
            <input type="color" value={form.color || '#0E2A47'} onChange={set('color')} />
          </div>
          <div className="admin-field">
            <label>Icon</label>
            <select value={form.icon} onChange={set('icon')}>
              {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="admin-field">
            <label>Phone</label>
            <input value={form.phone} onChange={set('phone')} />
          </div>
          <div className="admin-field">
            <label>Website (public link)</label>
            <input type="url" value={form.website} onChange={set('website')} />
          </div>
          <div className="admin-field full">
            <label>Logo URL</label>
            <input value={form.logo_url} onChange={set('logo_url')} placeholder="/resources/images/institutions/slug.png" />
          </div>
          <div className="admin-field full">
            <label>Services</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={serviceDraft}
                onChange={(e) => setServiceDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addService(); } }}
                placeholder="Type a service, press Enter"
              />
              <button type="button" className="admin-btn" style={{ width: 'auto', padding: '0 16px' }} onClick={addService}>Add</button>
            </div>
            <div className="admin-services-list">
              {form.services.map((s, i) => (
                <span className="admin-service-chip" key={`${s}-${i}`}>
                  {s}
                  <button type="button" onClick={() => removeService(i)} aria-label={`Remove ${s}`}>×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="admin-modal-actions">
          <button type="button" className="cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="save" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}

// ---------- scrape-target pages panel ----------
function PagesPanel({ institution, onClose }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null); // page id being edited, or 'new'
  const [draft, setDraft] = useState({ content_type: '', path: '', active: true });

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminInstitutionPages(institution.id)
      .then(setPages)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load pages.'))
      .finally(() => setLoading(false));
  }, [institution.id]);

  useEffect(() => { load(); }, [load]);

  const startEdit = (page) => {
    setEditingId(page.id);
    setDraft({ content_type: page.content_type, path: page.path, active: page.active });
  };

  const startNew = () => {
    setEditingId('new');
    setDraft({ content_type: '', path: '', active: true });
  };

  const cancelEdit = () => setEditingId(null);

  const save = async () => {
    if (!draft.content_type.trim() || !draft.path.trim()) return;
    setError(null);
    try {
      if (editingId === 'new') {
        await createAdminInstitutionPage(institution.id, draft);
      } else {
        await updateAdminInstitutionPage(institution.id, editingId, draft);
      }
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save that page.');
    }
  };

  const remove = async (page) => {
    if (!window.confirm(`Remove the "${page.content_type}" page? This also deletes its already-scraped content and embeddings — re-adding it later will need a fresh scrape.`)) return;
    try {
      await deleteAdminInstitutionPage(institution.id, page.id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove that page.');
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal" style={{ maxWidth: 680 }}>
        <h3>Scrape-target pages — {institution.name}</h3>
        <p style={{ fontSize: 12.5, color: '#6B7480', marginTop: -8, marginBottom: 14 }}>
          Each path is appended to the institution's base URL ({institution.base_url}) when scraping runs.
        </p>
        {error && <div className="admin-error">{error}</div>}
        {loading ? <p>Loading…</p> : (
          <table className="admin-table">
            <thead>
              <tr><th>Content type</th><th>Path</th><th>Active</th><th></th></tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                editingId === page.id ? (
                  <tr key={page.id}>
                    <td><input value={draft.content_type} onChange={(e) => setDraft((d) => ({ ...d, content_type: e.target.value }))} /></td>
                    <td><input value={draft.path} onChange={(e) => setDraft((d) => ({ ...d, path: e.target.value }))} /></td>
                    <td><input type="checkbox" checked={draft.active} onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))} /></td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" onClick={save}>Save</button>
                        <button type="button" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={page.id}>
                    <td>{page.content_type}</td>
                    <td style={{ wordBreak: 'break-all' }}>{page.path}</td>
                    <td>{page.active ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" onClick={() => startEdit(page)}>Edit</button>
                        <button type="button" className="danger" onClick={() => remove(page)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
              {editingId === 'new' && (
                <tr>
                  <td><input autoFocus placeholder="e.g. about" value={draft.content_type} onChange={(e) => setDraft((d) => ({ ...d, content_type: e.target.value }))} /></td>
                  <td><input placeholder="/about/" value={draft.path} onChange={(e) => setDraft((d) => ({ ...d, path: e.target.value }))} /></td>
                  <td><input type="checkbox" checked={draft.active} onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))} /></td>
                  <td>
                    <div className="admin-row-actions">
                      <button type="button" onClick={save}>Save</button>
                      <button type="button" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        {editingId === null && (
          <button type="button" className="admin-btn" style={{ width: 'auto', padding: '8px 16px', marginTop: 14 }} onClick={startNew}>
            + Add page
          </button>
        )}
        <div className="admin-modal-actions">
          <button type="button" className="cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ---------- scrape & embed panel ----------
const ACTIVE_RUN_STATUSES = ['queued', 'running'];

function ScrapePanel({ institution, onClose, onPublished }) {
  const [run, setRun] = useState(undefined); // undefined = still loading, null = no run yet
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const refresh = useCallback(() => {
    fetchLatestScrapeRun(institution.id)
      .then(setRun)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load scrape status.'));
  }, [institution.id]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!run || !ACTIVE_RUN_STATUSES.includes(run.status)) return;
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [run, refresh]);

  const start = async () => {
    setError(null);
    setStarting(true);
    try {
      const newRun = await triggerAdminScrape(institution.id);
      setRun(newRun);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start the scrape.');
    } finally {
      setStarting(false);
    }
  };

  const publish = async () => {
    setError(null);
    setPublishing(true);
    try {
      await updateAdminInstitution(institution.id, { ...institution, status: 'published' });
      onPublished();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not publish that institution.');
    } finally {
      setPublishing(false);
    }
  };

  const isActive = run && ACTIVE_RUN_STATUSES.includes(run.status);

  return (
    <div className="admin-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="admin-modal" style={{ maxWidth: 640 }}>
        <h3>Scrape & embed — {institution.name}</h3>
        <p style={{ fontSize: 12.5, color: '#6B7480', marginTop: -8, marginBottom: 14 }}>
          Fetches every active page configured for this institution, then chunks and embeds any new or changed content.
        </p>
        {error && <div className="admin-error">{error}</div>}

        {run === undefined ? <p>Loading…</p> : (
          <>
            {run && (
              <div style={{ marginBottom: 14 }}>
                <span className={`admin-status-badge ${run.status}`}>{run.status}</span>
                {run.log && (
                  <pre style={{
                    marginTop: 10, maxHeight: 260, overflowY: 'auto', background: '#F4F5F7',
                    borderRadius: 8, padding: 12, fontSize: 12.5, whiteSpace: 'pre-wrap',
                  }}>
                    {run.log}
                  </pre>
                )}
              </div>
            )}
            {!run && <p>No scrape has been run yet for this institution.</p>}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="admin-btn"
                style={{ width: 'auto', padding: '10px 18px' }}
                onClick={start}
                disabled={starting || isActive}
              >
                {isActive ? 'Running…' : starting ? 'Starting…' : 'Start scrape & embed'}
              </button>
              {institution.status !== 'published' && (
                <button
                  type="button"
                  className="admin-btn"
                  style={{ width: 'auto', padding: '10px 18px' }}
                  onClick={publish}
                  disabled={publishing}
                >
                  {publishing ? 'Publishing…' : 'Publish now'}
                </button>
              )}
            </div>
          </>
        )}

        <div className="admin-modal-actions">
          <button type="button" className="cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ---------- dashboard ----------
function AdminDashboard({ user, onSignOut }) {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // institution object, or {} for "new"
  const [managingPagesFor, setManagingPagesFor] = useState(null); // institution object
  const [scrapingFor, setScrapingFor] = useState(null); // institution object
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminInstitutions()
      .then(setInstitutions)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load institutions.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (inst) => {
    if (!window.confirm(`Delete "${inst.name}"? This cannot be undone.`)) return;
    try {
      await deleteAdminInstitution(inst.id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete that institution.');
    }
  };

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <b>JLOS Admin — {user.name}</b>
        <button type="button" onClick={onSignOut}>Sign out</button>
      </div>
      <div className="admin-main">
        <div className="admin-main-head">
          <h2>Institutions</h2>
          <button type="button" className="admin-btn" style={{ width: 'auto', padding: '10px 18px' }} onClick={() => setEditing({})}>
            + Add institution
          </button>
        </div>
        {error && <div className="admin-error">{error}</div>}
        {loading ? (
          <p>Loading…</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Slug</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {institutions.map((inst) => (
                <tr key={inst.id}>
                  <td>{inst.name}</td>
                  <td>{inst.slug}</td>
                  <td><span className={`admin-status-badge ${inst.status}`}>{inst.status}</span></td>
                  <td>
                    <div className="admin-row-actions">
                      <button type="button" onClick={() => setEditing(inst)}>Edit</button>
                      <button type="button" onClick={() => setManagingPagesFor(inst)}>Pages</button>
                      <button type="button" onClick={() => setScrapingFor(inst)}>Scrape</button>
                      <button type="button" className="danger" onClick={() => remove(inst)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <InstitutionForm
          institution={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      {managingPagesFor && (
        <PagesPanel
          institution={managingPagesFor}
          onClose={() => setManagingPagesFor(null)}
        />
      )}

      {scrapingFor && (
        <ScrapePanel
          institution={scrapingFor}
          onClose={() => setScrapingFor(null)}
          onPublished={() => { setScrapingFor(null); load(); }}
        />
      )}
    </div>
  );
}

// ---------- top level ----------
export default function AdminApp() {
  const [user, setUser] = useState(undefined); // undefined = still checking, null = signed out

  useEffect(() => {
    fetchMe().then((u) => setUser(u && u.role === 'admin' ? u : null));
  }, []);

  const handleSignOut = async () => {
    await logout();
    setUser(null);
  };

  if (user === undefined) return null; // brief check on load, nothing to flash
  if (!user) return <AdminLogin onSignedIn={setUser} />;
  return <AdminDashboard user={user} onSignOut={handleSignOut} />;
}
