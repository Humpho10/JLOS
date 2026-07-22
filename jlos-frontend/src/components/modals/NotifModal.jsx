import React from 'react';
import ModalShell from './ModalShell.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function NotifModal() {
  const { closeModal, goToPage } = useApp();
  const go = (page) => { closeModal('notifModal'); goToPage(page); };

  return (
    <ModalShell id="notifModal" title="Notifications">
      <button type="button" className="notif-item" onClick={() => go('page-track')}>
        <div className="notif-dot" aria-hidden="true"></div>
        <div><b>Ticket #JLOS-2931 updated</b><span>ODPP replied to your case perusal request · 2h ago</span></div>
      </button>
      <button type="button" className="notif-item" onClick={() => go('page-institutions')}>
        <div className="notif-dot" aria-hidden="true"></div>
        <div><b>TAT hearings now bookable online</b><span>Tax Appeals Tribunal added a new service · 1d ago</span></div>
      </button>
      <button type="button" className="notif-item" onClick={() => closeModal('notifModal')}>
        <div className="notif-dot" style={{ background: 'var(--line)' }} aria-hidden="true"></div>
        <div><b>Welcome to the JLOS Justice Portal</b><span>One entry point to all 8 JLOS institutions · 3d ago</span></div>
      </button>
    </ModalShell>
  );
}
