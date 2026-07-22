import React from 'react';
import TiltCard from '../components/TiltCard.jsx';
import { useApp } from '../context/AppContext.jsx';
import { activate } from '../utils/a11y.js';

export default function MorePage({ active }) {
  const { goToPage, openModal, language, t } = useApp();

  const items = [
    {
      onClick: () => goToPage('page-track'),
      icon: <path d="M9 11l3 3L22 4M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11" />,
      titleKey: 'more.myRequests.title', descKey: 'more.myRequests.desc',
    },
    {
      onClick: () => openModal('ussdModal'),
      icon: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></>,
      titleKey: 'more.ussd.title', descKey: 'more.ussd.desc',
    },
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
