import React from 'react';
import { useApp } from '../context/AppContext.jsx';

// ============================================================
// Small, persistent Justice AI bubble — fixed bottom-right on every
// page except the chat and institution-contact pages, which already
// have their own chat interface (no point offering to open one while
// you're already in one).
// ============================================================

export default function FloatingAssistant() {
  const { activePage, goToPage } = useApp();

  if (activePage === 'page-chat' || activePage === 'page-contact') return null;

  return (
    <button
      type="button"
      className="floating-assistant"
      onClick={() => goToPage('page-chat')}
      title="Chat with Justice AI"
      aria-label="Chat with Justice AI"
    >
      <span className="fa-glow" aria-hidden="true"></span>
      <i className="bi bi-robot" aria-hidden="true"></i>
      <span className="fa-dot" aria-hidden="true"></span>
    </button>
  );
}
