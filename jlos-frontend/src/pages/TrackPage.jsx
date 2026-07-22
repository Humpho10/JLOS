import React from 'react';
import TiltCard from '../components/TiltCard.jsx';
import { useApp } from '../context/AppContext.jsx';

const TICKETS = [
  {
    id: '#JLOS-2931', inst: 'ODPP · Case Perusal & Sanctioning', status: 'progress', statusLabel: 'In Progress',
    desc: 'Escalated from Justice AI chat — awaiting response from the assigned state attorney.',
    meta: ['Raised: 17 Jul 2026', 'ETA: 24 hrs'],
  },
  {
    id: '#JLOS-2870', inst: 'MoJ Administration · Certificate of No Objection', status: 'resolved', statusLabel: 'Resolved',
    desc: 'Certificate processed and emailed to applicant.',
    meta: ['Raised: 09 Jul 2026', 'Closed: 12 Jul 2026'],
  },
  {
    id: '#JLOS-2795', inst: 'UHRC · Complaint', status: 'open', statusLabel: 'Open',
    desc: 'Submitted via USSD callback request — call centre to phone back within 2 hours.',
    meta: ['Raised: 19 Jul 2026', 'Channel: USSD'],
  },
];

export default function TrackPage({ active }) {
  const { t } = useApp();
  return (
    <section className={`page ${active ? 'active' : ''}`} id="page-track">
      <div className="page-wrap">
        <div className="page-head">
          <h2>{t('page.track.title')}</h2>
          <p>{t('page.track.sub')}</p>
        </div>
        <div className="track-grid-web">
          {TICKETS.map((tk) => (
            <TiltCard className="ticket-card" maxTilt={4} key={tk.id}>
              <div className="ticket-top">
                <div>
                  <div className="ticket-id">{tk.id}</div>
                  <div className="ticket-inst">{tk.inst}</div>
                </div>
                <div className={`status-pill ${tk.status}`}>{tk.statusLabel}</div>
              </div>
              <div className="ticket-desc">{tk.desc}</div>
              <div className="ticket-meta"><span>{tk.meta[0]}</span><span>{tk.meta[1]}</span></div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
