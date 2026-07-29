import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../AdminAuthContext.jsx';
import { fetchMessages, replyToMessage } from '../api.js';
import Badge from '../components/Badge.jsx';
import Spinner from '../components/Spinner.jsx';

export default function AdminInboxPage() {
  const { token } = useAdminAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  function load() {
    setLoading(true);
    setError('');
    fetchMessages(token)
      .then((data) => {
        setMessages(data);
        setSelectedId((current) => current ?? data[0]?.id ?? null);
      })
      .catch((err) => setError(err.message || 'Could not load messages.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  const selected = messages.find((m) => m.id === selectedId) || null;

  async function handleReply(e) {
    e.preventDefault();
    if (!selected || !replyText.trim()) return;
    setSending(true);
    setError('');
    try {
      const updated = await replyToMessage(token, selected.id, replyText.trim());
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setReplyText('');
    } catch (err) {
      setError(err.message || 'Could not send the reply.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h2 className="mb-1 text-2xl font-semibold text-brand-navy">Inbox</h2>
      <p className="mb-6 text-sm text-brand-muted">Messages sent through each institution's contact page.</p>

      {error && (
        <div className="mb-5 rounded-lg border border-brand-danger/20 bg-brand-danger-bg px-3 py-2 text-sm text-brand-danger">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-brand-muted">
          <Spinner />
          Loading messages…
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand-line bg-brand-card p-10 text-center text-brand-muted">
          <div className="mb-2 text-3xl">📭</div>
          No messages yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[320px_1fr]">
          <ul className="space-y-2">
            {messages.map((m) => {
              const active = m.id === selectedId;
              return (
                <li key={m.id}>
                  <button
                    onClick={() => { setSelectedId(m.id); setReplyText(''); }}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      active
                        ? 'border-brand-navy-3 bg-white shadow-md shadow-brand-navy/10'
                        : 'border-brand-line bg-brand-card hover:border-brand-navy-3/50 hover:bg-white'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-brand-text">{m.name || 'Anonymous'}</span>
                      <Badge status={m.status} />
                    </div>
                    {m.institution && <div className="mb-1 text-xs text-brand-muted">{m.institution.name}</div>}
                    <p className="line-clamp-2 text-sm text-brand-muted">{m.body}</p>
                  </button>
                </li>
              );
            })}
          </ul>

          <div>
            {!selected ? (
              <div className="flex h-full items-center justify-center rounded-2xl border border-brand-line bg-brand-card p-10 text-brand-muted">
                Select a message to view it.
              </div>
            ) : (
              <div className="rounded-2xl border border-brand-line bg-brand-card p-6">
                <div className="mb-4 flex items-start justify-between gap-3 border-b border-brand-line pb-4">
                  <div>
                    <p className="font-medium text-brand-text">{selected.name || 'Anonymous'}</p>
                    {selected.email && <p className="text-sm text-brand-muted">{selected.email}</p>}
                    {selected.institution && <p className="mt-1 text-xs text-brand-muted">{selected.institution.name}</p>}
                  </div>
                  <Badge status={selected.status} />
                </div>

                <p className="whitespace-pre-wrap text-brand-text">{selected.body}</p>

                {selected.status === 'replied' ? (
                  <div className="mt-6 rounded-xl bg-brand-success-bg p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-success">Reply sent</p>
                    <p className="whitespace-pre-wrap text-brand-text">{selected.reply_body}</p>
                  </div>
                ) : (
                  <form onSubmit={handleReply} className="mt-6">
                    <label htmlFor="reply-body" className="mb-1.5 block text-sm font-medium text-brand-muted">
                      Reply
                    </label>
                    <textarea
                      id="reply-body"
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply…"
                      required
                      className="w-full resize-none rounded-lg border border-brand-line bg-brand-bg px-3 py-2.5 text-sm text-brand-text outline-none transition focus:border-brand-navy-3 focus:ring-2 focus:ring-brand-navy-3/20"
                    />
                    <button
                      type="submit"
                      disabled={sending || !replyText.trim()}
                      className="mt-3 flex items-center gap-2 rounded-lg bg-gradient-to-br from-brand-navy-3 to-brand-navy px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sending && <Spinner />}
                      {sending ? 'Sending…' : 'Send reply'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
