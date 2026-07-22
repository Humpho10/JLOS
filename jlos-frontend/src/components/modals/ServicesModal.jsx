import React from 'react';
import ModalShell from './ModalShell.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function ServicesModal() {
  const { closeModal, goToPage, openModal, chat } = useApp();
  const close = () => closeModal('servicesModal');

  const items = [
    {
      bg: 'linear-gradient(135deg,#FDECEA,#F9D2CB)', stroke: '#B3261E',
      path: <path d="M12 9v4M12 17h.01M10.3 3.9L2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />,
      title: 'File a Complaint', desc: 'Report an issue to the right institution',
      onClick: () => { close(); chat.startChat('I want to file a complaint'); },
    },
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
    {
      bg: 'linear-gradient(135deg,#EAF0F6,#D3E2F0)', stroke: '#0E2A47',
      path: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
      title: 'Book Appointment', desc: 'Pre-register your visit to JLOS Towers',
      onClick: () => { close(); openModal('bookModal'); },
    },
    {
      bg: 'linear-gradient(135deg,#FBF3DC,#F2E0AC)', stroke: '#C79A2E',
      path: <path d="M9 11l3 3L22 4M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" />,
      title: 'Track Request', desc: 'Check the status of your tickets',
      onClick: () => { close(); goToPage('page-track'); },
    },
    {
      bg: 'linear-gradient(135deg,#FDECEA,#F9D2CB)', stroke: '#B3261E',
      path: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.99.36 1.96.68 2.9a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.18-1.25a2 2 0 0 1 2.11-.45c.94.32 1.91.55 2.9.68A2 2 0 0 1 22 16.92z" />,
      title: 'Emergency Contacts', desc: 'Reach police & JLOS helplines fast',
      onClick: () => { close(); openModal('emergencyModal'); },
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
