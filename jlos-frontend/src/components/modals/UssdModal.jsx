import React from 'react';
import ModalShell from './ModalShell.jsx';
import { useApp } from '../../context/AppContext.jsx';

export default function UssdModal() {
  const { closeModal, pushToast } = useApp();

  return (
    <ModalShell id="ussdModal" title="USSD access">
      <div style={{ background: 'var(--bg)', borderRadius: '14px', padding: '18px', textAlign: 'center', marginTop: '10px' }}>
        <div style={{ fontFamily: 'Poppins', fontSize: '24px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '1px' }}>*256*5567#</div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>Works on any phone, no internet needed</div>
      </div>
      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '11px' }}>
        <div style={{ fontSize: '12.5px', lineHeight: 1.55 }}>1. Dial the code and describe your issue by menu selection.</div>
        <div style={{ fontSize: '12.5px', lineHeight: 1.55 }}>2. Your request is sent straight to the JLOS contact centre.</div>
        <div style={{ fontSize: '12.5px', lineHeight: 1.55 }}>3. An agent calls you back to continue — no data required.</div>
      </div>
      <button
        type="button"
        className="mc-btn primary"
        style={{ marginTop: '16px', padding: '12px 0', width: '100%' }}
        onClick={() => { closeModal('ussdModal'); pushToast('Callback requested — expect a call shortly'); }}
      >
        Request a callback now
      </button>
    </ModalShell>
  );
}
