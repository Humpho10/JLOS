import React, { useEffect, useState } from 'react';
import TiltCard from '../components/TiltCard.jsx';
import { useApp } from '../context/AppContext.jsx';
import { institutions } from '../data/institutions.js';
import { useVoiceInput } from '../hooks/useVoiceInput.js';
import InstitutionIcon from '../utils/InstitutionIcon.jsx';

const HERO_STATS = [
  { key: 'stat-institutions', value: String(institutions.length), labelKey: 'hero.stat.institutions', icon: 'bi-bank2' },
  { key: 'stat-support', value: '24/7', labelKey: 'hero.stat.support', icon: 'bi-clock-history' },
  { key: 'stat-free', value: null, labelKey: 'hero.stat.free', suffixKey: 'hero.stat.freeSuffix', icon: 'bi-patch-check-fill' },
];

// Counts up from 0 to `value` once on mount instead of just appearing — the
// only stat this applies to is the institutions count (a real number);
// "24/7" and "Free" aren't counts, so they're rendered as plain text.
function StatCount({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    let raf;
    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    // Backstop for when rAF is throttled or never fires (e.g. the page
    // loaded in a background tab) — guarantees the real number still shows
    // up shortly after mount instead of being stuck at 0 indefinitely.
    const fallback = setTimeout(() => setDisplay(value), duration + 150);
    return () => { cancelAnimationFrame(raf); clearTimeout(fallback); };
  }, [value]);

  return display;
}

function InstPill({ inst }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const hasLogo = inst.logo && !logoFailed;

  return (
    <a
      className="hero-inst-pill"
      href={inst.website}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${inst.short || inst.code} — visit website (opens in a new tab)`}
    >
      <span className="hero-inst-pill-ic" aria-hidden="true">
        {hasLogo ? (
          <img src={inst.logo} alt="" onError={() => setLogoFailed(true)} />
        ) : (
          <InstitutionIcon type={inst.icon} color={inst.color} />
        )}
      </span>
      {inst.short || inst.code}
    </a>
  );
}

/*const QUICK_SERVICES = [
  {
    id: 'browse-services', titleKey: 'qs.browseServices', subKey: 'qs.browseServices.sub',
    bg: 'linear-gradient(135deg,#E4F5EA,#C6E9D2)', color: '#1F8A57', icon: 'bi-grid-3x3-gap-fill',
  },
  {
    id: 'contact-centre', titleKey: 'qs.contactCentre', subKey: 'qs.contactCentre.sub',
    bg: 'linear-gradient(135deg,#F1EAFB,#DFCCF4)', color: '#6B3FA0', icon: 'bi-headset',
  },
];*/

export default function HomePage({ active }) {
  const { goToPage, openModal, chat, pushToast, t } = useApp();
  const [query, setQuery] = useState('');

  const submitQuery = () => {
    chat.findService(query);
  };

  const { listening, toggle: toggleVoice } = useVoiceInput({
    onTranscript: (text) => setQuery(text),
    onNoSupport: () => pushToast('Voice input needs a browser like Chrome or Edge.'),
    onError: () => pushToast("Didn't catch that — try again."),
  });

  /*const runQuickService = (id) => {
    if (id === 'browse-services') openModal('servicesModal');
    else if (id === 'contact-centre') openModal('supportModal');
  };*/

  return (
    <section className={`page ${active ? 'active' : ''}`} id="page-home">
      <div className="hero-web">
        <div className="hero-web-inner">
          <div className="hero-copy">
            <div className="hero-badge-web">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v18" /><path d="M5 7l7-4 7 4" /><path d="M5 7l-3 8a4 4 0 0 0 8 0z" /><path d="M19 7l-3 8a4 4 0 0 0 8 0z" /><path d="M8 21h8" />
              </svg>
              {t('hero.badge')}
            </div>
            <h1>
              <span className="h1-white">{t('hero.heading.part1')}</span><br />
              <span className="h1-gold">{t('hero.heading.highlight')}</span> <span className="h1-white">{t('hero.heading.part2')}</span>
              <span className="h1-dot"></span>
            </h1>
            <p className="hero-sub-web">{t('hero.sub')}</p>

            <div className="hero-inst-pills">
              {institutions.map((inst) => (
                <InstPill inst={inst} key={inst.code} />
              ))}
            </div>

            <div className="hero-stats-row">
              {HERO_STATS.map((stat) => {
                const isNumeric = stat.value != null && /^\d+$/.test(stat.value);
                return (
                  <div className="hero-stat" key={stat.key}>
                    <span className="hero-stat-ic"><i className={`bi ${stat.icon}`}></i></span>
                    <span className="hero-stat-text">
                      <b>{stat.value ? (isNumeric ? <StatCount value={Number(stat.value)} /> : stat.value) : t(stat.labelKey)}</b>
                      <span>{stat.value ? t(stat.labelKey) : t(stat.suffixKey)}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <TiltCard className="hero-search-card" maxTilt={1.2} as="div">
            <h2 className="hero-card-title">{t('hero.cardTitle')}</h2>
            <p className="hero-card-sub">{t('hero.cardSub')}</p>

            <div className="hero-search-row">
              <div className="hero-search-input-wrap">
                <i className="bi bi-search hero-search-ic" aria-hidden="true"></i>
                <input
                  id="homeQueryWeb"
                  type="text"
                  aria-label={t('hero.cardTitle')}
                  placeholder={listening ? 'Listening…' : t('hero.placeholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitQuery(); }}
                />
                <button
                  type="button"
                  className={`hero-mic-btn ${listening ? 'listening' : ''}`}
                  title="Speak your issue"
                  aria-label="Describe your issue by voice"
                  aria-pressed={listening}
                  onClick={toggleVoice}
                >
                  <i className="bi bi-mic-fill" aria-hidden="true"></i>
                </button>
              </div>
              <button type="button" className="hero-find-btn" onClick={submitQuery}>
                {t('hero.findService')}
                <i className="bi bi-arrow-right" aria-hidden="true"></i>
              </button>
            </div>

            {/* <div className="hero-or-divider"><span>{t('hero.or')}</span></div>

            <div className="hero-option-row">
              <button type="button" className="hero-option-card" onClick={() => goToPage('page-chat')}>
                <div className="hero-option-ic accent" aria-hidden="true"><i className="bi bi-robot"></i></div>
                <div className="hero-option-text">
                  <b>{t('hero.chatWithAi')}</b>
                  <span>{t('hero.getInstantAnswers')}</span>
                </div>
              </button>
            </div> */}
          </TiltCard>
        </div>
      </div>


    </section>
  );
}
