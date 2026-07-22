import React from 'react';
import ModalShell from './ModalShell.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function BookModal() {
  const { closeModal, pushToast } = useApp();
  return (
    <ModalShell id="bookModal" title="Book your visit">
      <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.6, marginTop: '8px' }}>
        On-site booking, guest registration and queue tokens are managed inside JLOS Towers through the
        Internal Portal. Pre-register here and front desk will have your floor, host and access token
        ready when you arrive.
      </p>
      <button
        type="button"
        className="mc-btn primary"
        style={{ marginTop: '16px', padding: '12px 0', width: '100%' }}
        onClick={() => { closeModal('bookModal'); pushToast('Pre-registration request sent'); }}
      >
        Pre-register my visit
      </button>
    </ModalShell>
  );
}
