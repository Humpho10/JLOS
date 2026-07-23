import React from 'react';
import TiltCard from '../components/TiltCard.jsx';
import { useApp } from '../context/AppContext.jsx';
import { activate } from '../utils/a11y.js';

export default function MorePage({ active }) {
  const { openModal, language, t } = useApp();

  const items = [
    {
      onClick: () => openModal('accessModal'),
      icon: <><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></>,
      titleKey: 'more.access.title', descKey: 'more.access.desc',
    },
    {
      onClick: () => openModal('langModal'),
      icon: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
      titleKey: 'more.language.title', desc: `${language} ${t('more.language.currentSuffix')}`,
    },
    {
      onClick: () => openModal('faqModal'),
      icon: <path d="M3 5h18M3 12h18M3 19h18" />,
      titleKey: 'more.faqs.title', descKey: 'more.faqs.desc',
    },
    {
      onClick: () => openModal('supportModal'),
      icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
      titleKey: 'more.support.title', descKey: 'more.support.desc',
    },
  ];

  return (
    <section className={`page ${active ? 'active' : ''}`} id="page-more">
      <div className="page-wrap">
        <div className="page-head">
          <h2>{t('page.more.title')}</h2>
          <p>{t('page.more.sub')}</p>
        </div>
        <div className="more-grid-web">
          {items.map((it) => (
            <TiltCard
              className="more-item"
              maxTilt={4}
              key={it.titleKey}
              onClick={it.onClick}
              role="button"
              tabIndex={0}
              onKeyDown={activate(it.onClick)}
            >
              <div className="more-ic" aria-hidden="true">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#0E2A47" strokeWidth="2">{it.icon}</svg>
              </div>
              <div className="more-txt"><b>{t(it.titleKey)}</b><p>{it.desc || t(it.descKey)}</p></div>
              <div className="more-arrow" aria-hidden="true">›</div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
