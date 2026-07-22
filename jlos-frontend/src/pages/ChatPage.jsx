import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useVoiceInput } from '../hooks/useVoiceInput.js';

// Read a message aloud with the browser's built-in speech synthesis —
// this is the "response" half of voice chat (the mic below handles input).
function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

function FileMsg({ msg }) {
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
      <div className="file-meta">{msg.isImage ? `${msg.name} · ${msg.sizeLabel}` : msg.sizeLabel}</div>
    </div>
  );
}

function ChatMessage({ msg }) {
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
  if (msg.kind === 'user') return <div className="msg user">{msg.text}</div>;
  if (msg.kind === 'bot') {
    return (
      <div className="msg bot">
        <div className="bot-tag">
          <div className="av">{msg.avatar || '⚖️'}</div><b>{msg.name || 'Justice AI'}</b>
          <button type="button" className="speak-btn" title="Read this reply aloud" onClick={() => speak(msg.text)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
            </svg>
          </button>
        </div>
        {msg.text}
      </div>
    );
  }
  return null;
}

export default function ChatPage({ active }) {
  const { chat, pushToast, t } = useApp();
  const bodyRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [chat.messages]);

  const { listening, toggle: toggleVoiceInput } = useVoiceInput({
    onResult: (transcript) => {
      chat.setChatInput(transcript);
      setTimeout(() => chat.runChatDemo(transcript), 300);
    },
    onNoSupport: () => pushToast('Voice input needs a browser like Chrome or Edge.'),
    onError: () => pushToast("Didn't catch that — try again."),
  });

  return (
    <section className={`page ${active ? 'active' : ''}`} id="page-chat">
      <div className="page-wrap">
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
              <h3>Justice AI Assistant{chat.dppInstitution ? ` · ${chat.dppInstitution.name}` : ''}</h3>
              <p id="chatStatusWeb" role="status" aria-live="polite">{chat.chatStatus}</p>
            </div>
          </div>
          <div className="chat-panel-body" id="chatBodyWeb" ref={bodyRef} role="log" aria-live="polite" aria-label="Conversation">
            {chat.messages.map((m) => <ChatMessage msg={m} key={m.id} />)}
          </div>
          <div className="chat-panel-input">
            <input
              type="file"
              id="chatFileInputWeb"
              accept="image/*,.pdf,.doc,.docx"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={(e) => {
                chat.handleFileAttach(e.target.files && e.target.files[0]);
                e.target.value = '';
              }}
            />
            <button type="button" className="attach-btn" title="Attach a file" aria-label="Attach a file" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3.5 3.5 0 0 1 4.95 4.95l-9.19 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
            </button>
            <input
              id="chatInputWeb"
              aria-label="Type your message"
              placeholder={listening ? 'Listening…' : 'Type your problem here...'}
              value={chat.chatInput}
              onChange={(e) => chat.setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') chat.runChatDemo(); }}
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
            <button type="button" className="send-btn" aria-label="Send message" onClick={() => chat.runChatDemo()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
