import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import InstitutionIcon from '../utils/InstitutionIcon.jsx';

function formatTime(ms) {
  if (!ms) return null;
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function ContactMessage({ msg }) {
  if (msg.kind === 'typing') {
    return (
      <div className="msg bot typing-wrap">
        <div className="typing"><span></span><span></span><span></span></div>
      </div>
    );
  }
  if (msg.kind === 'system') return <div className="msg system">{msg.text}</div>;
  if (msg.kind === 'user') {
    const time = formatTime(msg.time);
    return (
      <div className="msg user">
        {msg.text}
        {time && <div className="msg-time">{time}</div>}
      </div>
    );
  }
  if (msg.kind === 'bot') {
    const time = formatTime(msg.time);
    return (
      <div className="msg bot">
        <div className="bot-tag">
          <div className="av">{msg.avatar || '⚖️'}</div><b>{msg.name}</b>
          {time && <span className="msg-time">{time}</span>}
        </div>
        {msg.text}
      </div>
    );
  }
  return null;
}

export default function InstitutionContactPage({ active }) {
  const { activeInstitution, institutionChat, goToPage } = useApp();
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [institutionChat.messages]);

  // Same auto-grow-then-scroll behavior as the main chat's compose box.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    if (el.scrollHeight > 0) el.style.height = `${el.scrollHeight}px`;
  }, [institutionChat.input]);

  if (!activeInstitution) {
    return (
      <section className={`page ${active ? 'active' : ''}`} id="page-contact">
        <div className="page-wrap">
          <div className="contact-header">
            <h2>Contact an institution</h2>
            <p>Pick an institution from the directory to see its contact details.</p>
          </div>
          <button type="button" className="mc-btn primary" style={{ maxWidth: 220 }} onClick={() => goToPage('page-institutions')}>
            Browse institutions
          </button>
        </div>
      </section>
    );
  }

  const inst = activeInstitution;
  const telHref = `tel:${inst.phone.replace(/\s+/g, '')}`;
  const hasLogo = inst.logo && !logoFailed;

  return (
    <section className={`page ${active ? 'active' : ''}`} id="page-contact">
      <div className="page-wrap chat-page-wrap contact-page-wrap">
        {/* One compact bar — back link, identity, and the toll-free number
            all in a single row (WhatsApp's contact-header pattern) instead
            of three stacked blocks each claiming their own vertical space. */}
        <div className="contact-chat-bar">
          <button type="button" className="contact-chat-back" onClick={() => goToPage('page-institutions')} aria-label="Back to institutions">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div
            className="contact-chat-avatar"
            style={{ background: hasLogo ? '#fff' : inst.color, border: hasLogo ? '1px solid var(--line)' : 'none' }}
          >
            {hasLogo ? (
              <img src={inst.logo} alt="" onError={() => setLogoFailed(true)} />
            ) : (
              <InstitutionIcon type={inst.icon} color="#fff" />
            )}
          </div>
          <div className="contact-chat-identity">
            <div className="contact-chat-name">{inst.short || inst.name}</div>
            <a href={telHref} className="contact-chat-phone">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.99.36 1.96.68 2.9a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.18-1.25a2 2 0 0 1 2.11-.45c.94.32 1.91.55 2.9.68A2 2 0 0 1 22 16.92z" /></svg>
              {inst.phone}
            </a>
          </div>
        </div>

        {/* Its own classes (contact-chat*), not the AI chat page's
            (chat-panel*) — deliberately decoupled so this stays a plain,
            full-width conversation strip instead of the AI chat's boxed,
            width-capped design, and so styling one doesn't drag the other
            along with it. */}
        <div
          className="contact-chat-body"
          ref={bodyRef}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          {institutionChat.messages.map((m) => <ContactMessage msg={m} key={m.id} />)}
        </div>

        <div className="contact-chat-input">
          <textarea
            ref={inputRef}
            rows={1}
            aria-label={`Message ${inst.short || inst.name}`}
            placeholder={`Message ${inst.short || inst.name}...`}
            value={institutionChat.input}
            onChange={(e) => institutionChat.setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                institutionChat.run();
              }
            }}
          />
          <button type="button" className="send-btn" aria-label="Send message" onClick={() => institutionChat.run()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
