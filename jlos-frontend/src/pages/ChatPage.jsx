import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useVoiceInput } from '../hooks/useVoiceInput.js';
import { stripMarkdown } from '../utils/stripMarkdown.js';

// Persisted messages carry their real original time; canned/greeting
// messages have no `time` at all, so they render without one rather than
// showing a misleading "just now".
function formatTime(ms) {
  if (!ms) return null;
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function FileMsg({ msg }) {
  const time = formatTime(msg.time);
  return (
    <div className="msg file-msg">
      <div className="file-chip">
        {msg.isImage ? (
          <img src={msg.url} alt={msg.name} />
        ) : (
          <div className="file-doc">
            <div className="fd-ic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" /></svg>
            </div>
            <div className="fd-name">{msg.name}</div>
          </div>
        )}
      </div>
      <div className="file-meta">
        {msg.isImage ? `${msg.name} · ${msg.sizeLabel}` : msg.sizeLabel}
        {time && <span className="msg-time"> · {time}</span>}
      </div>
    </div>
  );
}

function ChatMessage({
  msg, speakingId, onToggleSpeak, copiedId, onCopy,
  editingId, editDraft, onEditDraftChange, onEditStart, onSaveEdit, onCancelEdit,
}) {
  if (msg.kind === 'typing') {
    return (
      <div className="msg bot typing-wrap">
        <div className="bot-tag"><div className="av">⚖️</div><b>Justice AI</b></div>
        <div className="typing"><span></span><span></span><span></span></div>
      </div>
    );
  }
  if (msg.kind === 'system') return <div className="msg system">{msg.text}</div>;
  if (msg.kind === 'file-msg') return <FileMsg msg={msg} />;
  if (msg.kind === 'user') {
    const time = formatTime(msg.time);
    const isCopied = copiedId === msg.id;

    if (editingId === msg.id) {
      return (
        <div className="msg user editing">
          <textarea
            className="msg-edit-textarea"
            value={editDraft}
            onChange={(e) => onEditDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSaveEdit(); }
              if (e.key === 'Escape') onCancelEdit();
            }}
            rows={2}
            autoFocus
            aria-label="Edit your question"
          />
          <div className="msg-edit-actions">
            <button type="button" className="mc-btn ghost" onClick={onCancelEdit}>Cancel</button>
            <button type="button" className="mc-btn primary" onClick={onSaveEdit}>Save &amp; resend</button>
          </div>
        </div>
      );
    }

    return (
      <div className="msg user">
        <div className="msg-user-actions">
          <button
            type="button"
            className="speak-btn"
            title={isCopied ? 'Copied!' : 'Copy'}
            aria-label={isCopied ? 'Copied to clipboard' : 'Copy your message'}
            onClick={() => onCopy(msg.id, msg.text)}
          >
            {isCopied ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="speak-btn"
            title="Edit and resend"
            aria-label="Edit and resend this message"
            onClick={() => onEditStart(msg.id, msg.text)}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        </div>
        {msg.text}
        {time && <div className="msg-time">{time}</div>}
      </div>
    );
  }
  if (msg.kind === 'bot') {
    const isSpeaking = speakingId === msg.id;
    const isCopied = copiedId === msg.id;
    const cleanText = stripMarkdown(msg.text);
    const time = formatTime(msg.time);
    return (
      <div className="msg bot">
        <div className="bot-tag">
          <div className="av">{msg.avatar || '⚖️'}</div><b>{msg.name || 'Justice AI'}</b>
          <button
            type="button"
            className="speak-btn"
            title={isCopied ? 'Copied!' : 'Copy this reply'}
            aria-label={isCopied ? 'Copied to clipboard' : 'Copy this reply'}
            onClick={() => onCopy(msg.id, cleanText)}
          >
            {isCopied ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className={`speak-btn ${isSpeaking ? 'speaking' : ''}`}
            title={isSpeaking ? 'Stop reading this reply aloud' : 'Read this reply aloud'}
            aria-label={isSpeaking ? 'Stop reading this reply aloud' : 'Read this reply aloud'}
            aria-pressed={isSpeaking}
            onClick={() => onToggleSpeak(msg.id, cleanText)}
          >
            {isSpeaking ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
              </svg>
            )}
          </button>
          {time && <span className="msg-time">{time}</span>}
        </div>
        {cleanText}
      </div>
    );
  }
  return null;
}

export default function ChatPage({ active }) {
  const { chat, pushToast, t } = useApp();
  const bodyRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const [speakingId, setSpeakingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState('');

  // Also re-run when `active` flips true: other pages stay mounted (just
  // CSS-hidden) while inactive, so a message arriving while this page is
  // hidden measures scrollHeight as 0 and this is a no-op — switching back
  // to the chat page doesn't itself change `chat.messages`, so without this
  // dependency the view is left stranded at the top until the next message.
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [chat.messages, active]);

  // Auto-grow the compose box as the user types, up to a max height
  // enforced in CSS (past which it scrolls internally instead of growing).
  // Other pages stay mounted (just CSS-hidden) while inactive, so scrollHeight
  // can read 0 here — only commit a real measurement, never a bogus 0px.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    if (el.scrollHeight > 0) {
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [chat.chatInput]);

  const toggleSpeak = useCallback((id, text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.onend = () => setSpeakingId(null);
    utter.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utter);
    setSpeakingId(id);
  }, [speakingId]);

  // Stop any speech synthesis in progress if the page is left mid-playback.
  useEffect(() => () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const copyReply = useCallback((id, text) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1800);
      })
      .catch(() => pushToast('Could not copy — try selecting the text instead.'));
  }, [pushToast]);

  const startEdit = useCallback((id, text) => {
    setEditingId(id);
    setEditDraft(text);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft('');
  }, []);

  const saveEdit = useCallback(() => {
    if (!editDraft.trim()) return;
    chat.editMessage(editingId, editDraft);
    setEditingId(null);
    setEditDraft('');
  }, [chat, editingId, editDraft]);

  const { listening, toggle: toggleVoiceInput } = useVoiceInput({
    onTranscript: (text) => chat.setChatInput(text),
    onFinish: (text) => chat.sendMessage(text),
    onNoSupport: () => pushToast('Voice input needs a browser like Chrome or Edge.'),
    onError: () => pushToast("Didn't catch that — try again."),
  });

  return (
    <section className={`page ${active ? 'active' : ''}`} id="page-chat">
      <div className="page-wrap chat-page-wrap">
        <div className="page-head">
          <h2>{t('page.chat.title')}</h2>
          <p>{t('page.chat.sub')}</p>
        </div>
        <div className="chat-panel">
          <div className="chat-panel-head">
            <div className="cph-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 11.5a8.4 8.4 0 0 1-1 4 8.5 8.5 0 0 1-7.5 4.5A8.4 8.4 0 0 1 8 19l-5 1 1-5a8.4 8.4 0 0 1-1-4A8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5z" /></svg>
            </div>
            <div>
              <h3>Justice AI Assistant</h3>
              <p id="chatStatusWeb" role="status" aria-live="polite">{chat.chatStatus}</p>
            </div>
          </div>
          <div className="chat-panel-body" id="chatBodyWeb" ref={bodyRef} role="log" aria-live="polite" aria-label="Conversation">
            {chat.messages.map((m) => (
              <ChatMessage
                msg={m}
                key={m.id}
                speakingId={speakingId}
                onToggleSpeak={toggleSpeak}
                copiedId={copiedId}
                onCopy={copyReply}
                editingId={editingId}
                editDraft={editDraft}
                onEditDraftChange={setEditDraft}
                onEditStart={startEdit}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
              />
            ))}
          </div>
          <div className="chat-compose">
            {chat.pendingAttachment && (
              <div className="attachment-preview">
                {chat.pendingAttachment.isImage ? (
                  <img src={chat.pendingAttachment.url} alt="" />
                ) : (
                  <div className="ap-ic">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" /></svg>
                  </div>
                )}
                <div className="ap-info">
                  <div className="ap-name">{chat.pendingAttachment.name}</div>
                  <div className="ap-type">{chat.pendingAttachment.typeLabel}</div>
                </div>
                <button type="button" className="ap-remove" aria-label="Remove attachment" onClick={chat.clearAttachment}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            )}
            <div className="chat-panel-input">
              <input
                type="file"
                id="chatFileInputWeb"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={(e) => {
                  chat.attachFile(e.target.files && e.target.files[0]);
                  e.target.value = '';
                }}
              />
              <button type="button" className="attach-btn" title="Attach an image or PDF" aria-label="Attach an image or PDF" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.19 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
              </button>
              <textarea
                id="chatInputWeb"
                ref={inputRef}
                rows={1}
                aria-label="Type your message"
                placeholder={chat.pendingAttachment ? 'Add a note about this file (optional)...' : listening ? 'Listening…' : 'Type your problem here...'}
                value={chat.chatInput}
                onChange={(e) => chat.setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    chat.sendMessage();
                  }
                }}
              />
              <button
                type="button"
                className={`mic-btn ${listening ? 'listening' : ''}`}
                title="Speak your message"
                aria-label="Speak your message"
                aria-pressed={listening}
                onClick={toggleVoiceInput}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8" />
                </svg>
              </button>
              <button type="button" className="send-btn" aria-label="Send message" onClick={() => chat.sendMessage()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
