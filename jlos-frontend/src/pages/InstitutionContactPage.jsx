import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import InstitutionIcon from '../utils/InstitutionIcon.jsx';

function ContactMessage({ msg }) {
  if (msg.kind === 'typing') {
    return (
      <div className="msg bot typing-wrap">
        <div className="typing"><span></span><span></span><span></span></div>
      </div>
    );
  }
  if (msg.kind === 'system') return <div className="msg system">{msg.text}</div>;
  if (msg.kind === 'user') return <div className="msg user">{msg.text}</div>;
  if (msg.kind === 'bot') {
    return (
      <div className="msg bot">
        <div className="bot-tag"><div className="av">{msg.avatar || '⚖️'}</div><b>{msg.name}</b></div>
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
          <div className="page-head">
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

  return (
    <section className={`page ${active ? 'active' : ''}`} id="page-contact">
      <div className="page-wrap chat-page-wrap">
        <div className="page-head">
          <button type="button" className="contact-back-link" onClick={() => goToPage('page-institutions')}>
            ← Institutions
          </button>
          <h2>{inst.name}</h2>
          <p>{inst.sub}</p>
        </div>

        <div className="contact-phone-card">
          <div className="contact-phone-ic" style={{ background: inst.color }} aria-hidden="true">
            <InstitutionIcon type={inst.icon} color="#fff" />
          </div>
          <div className="contact-phone-text">
            <span>Toll-free number</span>
            <a href={telHref} className="contact-phone-number">{inst.phone}</a>
          </div>
          <a href={telHref} className="contact-call-btn">Call now</a>
        </div>

        <div className="chat-panel">
          <div className="chat-panel-head">
            <div className="cph-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            <div>
              <h3>Message {inst.short || inst.name}</h3>
              <p role="status" aria-live="polite">{institutionChat.status}</p>
            </div>
          </div>
          <div className="chat-panel-body" ref={bodyRef} role="log" aria-live="polite" aria-label="Conversation">
            {institutionChat.messages.map((m) => <ContactMessage msg={m} key={m.id} />)}
          </div>
          <div className="chat-panel-input">
            <textarea
              ref={inputRef}
              rows={1}
              aria-label={`Message ${inst.short || inst.name}`}
              placeholder={`Message ${inst.short || inst.name}...`}
              value={institutionChat.input}
              onChange={(e) => institutionChat.setInput(e.target.value)}
            />
            <button type="button" className="send-btn" aria-label="Send message" onClick={() => institutionChat.run()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
