import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import TiltCard from './TiltCard.jsx';
import InstitutionIcon from '../utils/InstitutionIcon.jsx';
import { useApp } from '../context/AppContext.jsx';
import { activate } from '../utils/a11y.js';

export default function InstitutionCard({ inst, autoOpen = false }) {
  const { goToInstitutionContact } = useApp();
  const [open, setOpen] = useState(autoOpen);
  const [logoFailed, setLogoFailed] = useState(false);
  const innerRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(0);

  const hasLogo = inst.logo && !logoFailed;
  const servicesId = `${inst.code}-services`;
  const toggle = () => setOpen((v) => !v);

  // All pages stay mounted, so re-focusing this same card from elsewhere
  // (e.g. tapping it again on the home page) needs to re-open it even if
  // the user had since collapsed it, not just on first mount.
  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  // The panel's real height depends on its content (services list length
  // varies per institution), so it's measured rather than guessed — this
  // runs after the 'open' class (and the margin/padding it adds) has
  // already been committed to the DOM, so scrollHeight reflects the true
  // expanded size, not the collapsed one.
  useLayoutEffect(() => {
    if (!innerRef.current) return;
    setMaxHeight(open ? innerRef.current.scrollHeight : 0);
  }, [open]);

  return (
    <TiltCard id={`inst-${inst.code}`} className={`inst-card ${open ? 'open' : ''}`} maxTilt={5}>
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
        <div className="ic-chev" aria-hidden="true">▾</div>
      </div>
      <div className="ic-services" id={servicesId} style={{ maxHeight }}>
        <div className="ic-services-inner" ref={innerRef}>
          {inst.services.map((s) => (
            <span className="svc-chip" key={s}>{s}</span>
          ))}
          <div className="ic-actions">
            <button
              type="button"
              className="mc-btn primary"
              style={{ flex: 1, padding: '10px 0' }}
              onClick={(e) => { e.stopPropagation(); goToInstitutionContact(inst); }}
            >
              Chat now
            </button>
            <a
              href={`tel:${inst.phone.replace(/\s+/g, '')}`}
              className="mc-btn ghost"
              style={{ flex: 1, padding: '10px 0', textAlign: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              Call
            </a>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
