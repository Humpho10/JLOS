import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { NAV_ITEMS } from '../data/navItems.js';
import { institutions } from '../data/institutions.js';
import { pressable } from '../utils/a11y.js';

export default function Footer() {
  const { goToPage, openModal, t } = useApp();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <div className="footer-brand-row">
              <img
                src="/resources/images/jlos-logo.png"
                alt="JLOS logo"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://jlos.go.ug/wp-content/uploads/2025/09/JLOS-logo-250x112.png';
                }}
              />
              <div>
                <b>JLOS Justice Portal</b>
                <span>{t('footer.tagline')}</span>
              </div>
            </div>
            <p>{t('footer.desc')}</p>
          </div>

          <div className="footer-col">
            <h4>{t('footer.quickLinks')}</h4>
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <span {...pressable(() => goToPage(item.id))}>{t(item.labelKey) || item.label}</span>
                </li>
              ))}
              <li><span {...pressable(() => openModal('faqModal'), { 'aria-haspopup': 'dialog' })}>{t('footer.faqs')}</span></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('footer.institutions')}</h4>
            <ul>
              {institutions.map((inst) => (
                <li key={inst.code}>
                  <span {...pressable(() => goToPage('page-institutions'))}>{inst.code} — {inst.sub}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('footer.contact')}</h4>
            <ul className="footer-contact">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.99.36 1.96.68 2.9a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.18-1.25a2 2 0 0 1 2.11-.45c.94.32 1.91.55 2.9.68A2 2 0 0 1 22 16.92z" /></svg>
                +256-414-253207
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                JLOS Towers, Plot 98–102 Katalima Road, Naguru, Kampala
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" /></svg>
                Dial *256*5567# (USSD, no data needed)
              </li>
              <li className="footer-emergency" {...pressable(() => openModal('emergencyModal'), { 'aria-haspopup': 'dialog' })}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 9v4M12 17h.01M10.3 3.9L2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
                {t('footer.emergency')}
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="coa-chip-web" title="Coat of Arms of Uganda">
            <img
              src="https://commons.wikimedia.org/wiki/Special:FilePath/Coat_of_arms_of_Uganda.svg"
              alt="Coat of Arms of Uganda"
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
            />
          </div>
          <span>© {year} JLOS Justice Portal · {t('footer.rights')}</span>
        </div>
      </div>
    </footer>
  );
}
