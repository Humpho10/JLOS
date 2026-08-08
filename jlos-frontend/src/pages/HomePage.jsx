import React, { useState } from 'react';
import HeroSlideshow from '../components/HeroSlideshow.jsx';
import Reveal from '../components/Reveal.jsx';
import TiltCard from '../components/TiltCard.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useVoiceInput } from '../hooks/useVoiceInput.js';
import InstitutionIcon from '../utils/InstitutionIcon.jsx';

// One real photo per institution, sourced from each institution's own
// website (checked directly rather than guessed — see credit for the
// exact page it came from). Kept as page-relative-sized JPEGs already
// published by each site rather than re-hosting/re-encoding them.
const HERO_SLIDES = [
  {
    image: 'https://jlos.go.ug/wp-content/uploads/2025/09/j1.jpg',
    alt: 'JLOS — a sector-wide approach bringing together 18 institutions',
    credit: 'JLOS',
  },
  {
    image: 'https://uhrc.ug/wp-content/uploads/2025/11/The-Commission-Tribunal-headed-by-the-Hon.-Chairperson-Mariam-Wangadya-hearing-cases-of-alleged-human-rights-violations-at-the-Jinja-Regional-Office-700x539.jpeg',
    alt: 'Uganda Human Rights Commission Tribunal hearing a case',
    credit: 'Uganda Human Rights Commission',
  },
  {
    image: 'https://dpp.go.ug/wp-content/uploads/2025/11/handover-scaled.jpg',
    alt: 'Office of the Director of Public Prosecutions handover ceremony',
    credit: 'Office of the DPP',
  },
  {
    image: 'https://tat.go.ug/wp-content/uploads/2026/06/8K2A7949-scaled.jpg',
    alt: 'Tax Appeals Tribunal',
    credit: 'Tax Appeals Tribunal',
  },
  {
    image: 'https://www.jsc.go.ug/wp-content/themes/jsc/img/1.jpg',
    alt: 'Judicial Service Commission',
    credit: 'Judicial Service Commission',
  },
];

// Sourced from jlos.go.ug/about-jlos — kept short and paraphrased rather
// than quoted at length; "Learn more" links out to the source for the
// full history/roadmap instead of duplicating it here.
const HOW_IT_WORKS = [
  {
    num: '1',
    title: 'Tell us what’s going on',
    body: 'Describe your situation in your own words, typed or spoken. No legal jargon required.',
  },
  {
    num: '2',
    title: 'Get real answers',
    body: 'Justice AI draws on official JLOS information to explain your options and what to do next, not just a name and a phone number.',
  },
  {
    num: '3',
    title: 'Take the next step',
    body: 'Need to act on it? Chat directly with the right institution, call its toll-free line or visit in person.',
  },
];

function InstTeaserCard({ inst, delay }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const hasLogo = inst.logo && !logoFailed;

  return (
    <Reveal as="a" className="inst-teaser-card" delay={delay}
      href={inst.website}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${inst.name} — visit website (opens in a new tab)`}
    >
      <span className="inst-teaser-logo" style={{ background: hasLogo ? '#fff' : inst.color }}>
        {hasLogo ? (
          <img src={inst.logo} alt="" onError={() => setLogoFailed(true)} />
        ) : (
          <InstitutionIcon type={inst.icon} color="#fff" />
        )}
      </span>
      <span className="inst-teaser-text">
        <b>{inst.short || inst.code}</b>
        <span>{inst.sub}</span>
      </span>
      <i className="bi bi-box-arrow-up-right inst-teaser-arrow" aria-hidden="true"></i>
    </Reveal>
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
  const { goToPage, openModal, chat, pushToast, t, institutions } = useApp();
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
        <HeroSlideshow slides={HERO_SLIDES} />
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

      {/* ============ TRUST BAR — institution quick-links + stats, ============
          moved out of the hero so the hero itself stays focused on the
          slideshow + search card. Institutions render as a proper card
          grid (logo, name, role) rather than small pills — reads as a real
          directory teaser and reflows cleanly as more institutions join. */}
      <section className="home-section trust-bar-section">
        <div className="home-section-inner">
          <Reveal className="home-section-head">
            <span className="home-eyebrow">JLOS Institutions</span>
            <h2>Every institution, one click away.</h2>
            <p>Tap through to any institution's own site or find its services and contact details in the directory.</p>
          </Reveal>

          <div className="inst-teaser-grid">
            {institutions.map((inst, i) => (
              <InstTeaserCard inst={inst} key={inst.code} delay={i * 70} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHAT IS JLOS ============ */}
      <section className="home-section about-jlos-section">
        <div className="home-section-inner">
          <Reveal className="home-section-head">
            <span className="home-eyebrow">About JLOS</span>
            <h2>Uganda's justice system, working as one sector.</h2>
            <p>
              The Justice, Law and Order Sector (JLOS) brings together 18 institutions with closely
              linked mandates, administering justice, maintaining law and order and promoting the
              observance of human rights. Launched in 1999, it's one of Uganda's longest-running
              sector-wide reform efforts and this portal is your entry point to it.
            </p>
            <a
              className="about-jlos-learn-more"
              href="https://jlos.go.ug/about-jlos/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about JLOS
              <i className="bi bi-arrow-right" aria-hidden="true"></i>
            </a>
          </Reveal>

          <div className="mission-vision-row">
            <Reveal as="div" className="mv-card" delay={80}>
              <b>Mission</b>
              <p>
                To improve the safety of the person, security of property and access to justice
                for inclusive growth with the overall goal to promote the rule of law.
              </p>
            </Reveal>
            <Reveal as="div" className="mv-card" delay={160}>
              <b>Vision</b>
              <p>To ensure that people in Uganda live in a safe and just society.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ HOW THIS PORTAL WORKS ============ */}
      <section className="home-section how-it-works-section">
        <div className="home-section-inner">
          <Reveal className="home-section-head">
            <span className="home-eyebrow">How JLOS Justice Portal Works?</span>
            <h2>Three steps to real answers.</h2>
            <p>No account, no forms to hunt for, just describe what's going on.</p>
          </Reveal>

          <div className="how-it-works-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal as="div" className="how-step" key={step.num} delay={i * 120}>
                <span className="how-step-num">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CLOSING CTA ============ */}
      <section className="home-cta-section">
        <Reveal as="div" className="home-cta-inner">
          <div className="home-cta-text">
            <h2>Need help right now?</h2>
            <p>Justice AI is online and ready to listen, describe your issue and get matched in seconds.</p>
          </div>
          <button type="button" className="home-cta-btn" onClick={() => goToPage('page-chat')}>
            Chat with Justice AI
            <i className="bi bi-arrow-right" aria-hidden="true"></i>
          </button>
        </Reveal>
      </section>
    </section>
  );
}
