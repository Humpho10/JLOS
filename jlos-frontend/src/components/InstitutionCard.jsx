import React, { useState } from 'react';
import InstitutionIcon from '../utils/InstitutionIcon.jsx';
import { useApp } from '../context/AppContext.jsx';

// Full-width row, everything visible up front — no accordion. Services and
// the Chat action used to be hidden behind a click-to-expand toggle; with
// only a handful of institutions (more on the way) that extra click bought
// nothing, so the whole card is just laid out flat instead.
export default function InstitutionCard({ inst }) {
  const { goToInstitutionContact } = useApp();
  const [logoFailed, setLogoFailed] = useState(false);

  const hasLogo = inst.logo && !logoFailed;

  return (
    <div className="inst-row" id={`inst-${inst.code}`}>
      <div className="inst-row-head">
        <div
          className="ic-logo"
          style={{ background: hasLogo ? '#fff' : inst.color, border: hasLogo ? '1px solid var(--line)' : 'none' }}
        >
          {hasLogo ? (
            <img src={inst.logo} alt={`${inst.name} logo`} onError={() => setLogoFailed(true)} />
          ) : (
            <InstitutionIcon type={inst.icon} color={hasLogo ? inst.color : '#fff'} />
          )}
        </div>
        <div>
          <div className="ic-name">{inst.name}</div>
          <div className="ic-sub">{inst.sub}</div>
        </div>
      </div>

      <div className="inst-row-services">
        {inst.services.map((s) => (
          <span className="svc-chip" key={s}>{s}</span>
        ))}
      </div>

      <div className="inst-row-actions">
        <button
          type="button"
          className="mc-btn primary"
          onClick={() => goToInstitutionContact(inst)}
        >
          Chat now
        </button>
      </div>
    </div>
  );
}
