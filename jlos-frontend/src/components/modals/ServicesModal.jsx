import React from 'react';
import ModalShell from './ModalShell.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function ServicesModal() {
  const { closeModal, chat } = useApp();
  const close = () => closeModal('servicesModal');

  const items = [
    {
      bg: 'linear-gradient(135deg,#E4F5EA,#C6E9D2)', stroke: '#1F8A57',
      path: <><path d="M12 3v18" /><path d="M5 7l7-4 7 4" /><path d="M5 7l-3 8a4 4 0 0 0 8 0z" /><path d="M19 7l-3 8a4 4 0 0 0 8 0z" /><path d="M8 21h8" /></>,
      title: 'Legal Aid', desc: 'Get free or subsidized legal support',
      onClick: () => { close(); chat.startChat('I need legal aid'); },
    },
    {
      bg: 'linear-gradient(135deg,#F1EAFB,#DFCCF4)', stroke: '#6B3FA0',
      path: <path d="M12 21s-6.5-4.35-9-8.5C1 8.5 3 5 6.5 5 9 5 12 7.5 12 7.5S15 5 17.5 5C21 5 23 8.5 21 12.5 18.5 16.65 12 21 12 21z" />,
      title: 'Human Rights', desc: 'Raise a concern with UHRC',
      onClick: () => { close(); chat.startChat('I want to raise a human rights concern'); },
    },
  ];

  return (
    <ModalShell id="servicesModal" title="Popular Services" wide>
      <p style={{ fontSize: '11.8px', color: 'var(--muted)', marginTop: '4px' }}>Tap a service to get started instantly.</p>
      <div className="svc-modal-grid">
        {items.map((it) => (
          <button type="button" className="svc-modal-card" key={it.title} onClick={it.onClick}>
            <div className="smc-icon" style={{ background: it.bg }} aria-hidden="true">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={it.stroke} strokeWidth="2">{it.path}</svg>
            </div>
            <b>{it.title}</b>
            <span>{it.desc}</span>
          </button>
        ))}
      </div>
    </ModalShell>
  );
}
