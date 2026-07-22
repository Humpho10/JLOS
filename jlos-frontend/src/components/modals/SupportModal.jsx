import React from 'react';
import ModalShell from './ModalShell.jsx';

export default function SupportModal() {
  return (
    <ModalShell id="supportModal" title="Support & About Us">
      <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, marginTop: '6px' }}>
        JLOS brings together eight core institutions to administer justice and maintain law and order.
        The Justice Portal is your single entry point to reach any of them.
      </p>
      <div style={{ marginTop: '10px' }}>
        <div className="support-line">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.99.36 1.96.68 2.9a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.18-1.25a2 2 0 0 1 2.11-.45c.94.32 1.91.55 2.9.68A2 2 0 0 1 22 16.92z" /></svg>
          <div><b>+256-414-253207</b><span>JLOS Secretariat helpline</span></div>
        </div>
        <div className="support-line">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
          <div><b>JLOS Towers, 7th Floor Tower 3</b><span>Plot 98–102 Katalima Road, Naguru, Kampala</span></div>
        </div>
        <div className="support-line">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></svg>
          <div><b>Email the Secretariat</b><span>General enquiries answered within 24 hours</span></div>
        </div>
      </div>
    </ModalShell>
  );
}
