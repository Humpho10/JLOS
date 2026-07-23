import React, { useState } from 'react';
import TiltCard from './TiltCard.jsx';
import InstitutionIcon from '../utils/InstitutionIcon.jsx';
import { useApp } from '../context/AppContext.jsx';
import { activate } from '../utils/a11y.js';

export default function InstitutionCard({ inst }) {
  const { chat } = useApp();
  const [open, setOpen] = useState(false);
  const servicesId = `${inst.code}-services`;
  const toggle = () => setOpen((v) => !v);

  return (
    <TiltCard className={`inst-card ${open ? 'open' : ''}`} maxTilt={5}>
      <div
        className="ic-top"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={servicesId}
        aria-label={`${inst.name} — ${open ? 'hide' : 'show'} services`}
        onClick={toggle}
        onKeyDown={activate(toggle)}
      >
        <div className="ic-logo" style={{ background: inst.color }}>
          <InstitutionIcon type={inst.icon} color="#fff" />
        </div>
        <div>
          <div className="ic-name">{inst.name}</div>
          <div className="ic-sub">{inst.sub}</div>
        </div>
        <div className="ic-chev" aria-hidden="true">▾</div>
      </div>
      <div className="ic-services" id={servicesId}>
        {inst.services.map((s) => (
          <span className="svc-chip" key={s}>{s}</span>
        ))}
        <div className="ic-actions">
          <button
            type="button"
            className="mc-btn primary"
            style={{ flex: 1, padding: '10px 0' }}
            onClick={(e) => { e.stopPropagation(); chat.startChat(`I have a question about the ${inst.name}`); }}
          >
            Chat now
          </button>
        </div>
      </div>
    </TiltCard>
  );
}
