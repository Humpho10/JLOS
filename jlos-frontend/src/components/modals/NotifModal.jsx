import React from 'react';
import ModalShell from './ModalShell.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function NotifModal() {
  const { closeModal, goToPage } = useApp();
  const go = (page) => { closeModal('notifModal'); goToPage(page); };

  return (
    <ModalShell id="notifModal" title="Notifications">
      <button type="button" className="notif-item" onClick={() => go('page-chat')}>
        <div className="notif-dot" aria-hidden="true"></div>
        <div><b>The Judiciary is now covered by Justice AI</b><span>Ask about courts, appeals & filing guidance · new</span></div>
      </button>
      <button type="button" className="notif-item" onClick={() => go('page-track')}>
        <div className="notif-dot" aria-hidden="true"></div>
        <div><b>Sample: Ticket #JLOS-2931 updated</b><span>Illustrative ticket — live tracking coming soon</span></div>
      </button>
      <button type="button" className="notif-item" onClick={() => closeModal('notifModal')}>
        <div className="notif-dot" style={{ background: 'var(--line)' }} aria-hidden="true"></div>
        <div><b>Welcome to the JLOS Justice Portal</b><span>One entry point across JLOS institutions · 3d ago</span></div>
      </button>
    </ModalShell>
  );
}
