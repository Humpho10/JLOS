import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { NAV_ITEMS } from '../data/navItems.js';

//const is a standard JavaScript keyword used to declare block-scoped variables whose references cannot be reassigned

const LANG_CODES = { English: 'EN', Luganda: 'LG', Kiswahili: 'SW', Ateso: 'AT' };

export default function Navbar() {
  const { activePage, goToPage, isDark, toggleTheme, openModal, language, t, user, handleLogout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (id) => {
    goToPage(id);
    setMobileOpen(false);
  };

  return (
    <>
      <nav className="navbar" aria-label="Primary">
        <div className="nav-left">
          <button type="button" className="brand-cluster-web" onClick={() => goToPage('page-home')} aria-label="JLOS Justice Portal — go to homepage">
            <div className="brand-chip-web">
              <img
                src="/resources/images/JLOS-logo.png"
                alt="JLOS — Justice, Law and Order Sector"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://jlos.go.ug/wp-content/uploads/2025/09/JLOS-logo-250x112.png';
                }}
              />
            </div>
            <div className="nav-title">
              JLOS Justice Portal
              <span>{t('nav.tagline')}</span>
            </div>
          </button>
          <div className="nav-links" id="navLinks">
            {NAV_ITEMS.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                data-nav={item.id}
                aria-current={activePage === item.id ? 'page' : undefined}
                onClick={() => goToPage(item.id)}
              >
                {t(item.labelKey) || item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="nav-right">
          <button
            type="button"
            className="nav-icon-btn"
            id="themeToggleBtn"
            onClick={toggleTheme}
            aria-pressed={isDark}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <span id="themeIconWrap" style={{ display: 'flex' }}>
              <i className={`bi ${isDark ? 'bi-moon-stars-fill' : 'bi-sun-fill'}`} aria-hidden="true"></i>
            </span>
          </button>
          <button
            type="button"
            className="nav-icon-btn"
            onClick={() => openModal('notifModal')}
            aria-haspopup="dialog"
            aria-label="Notifications, 3 unread"
          >
            <i className="bi bi-bell-fill" aria-hidden="true"></i>
            <span className="nav-badge-count" aria-hidden="true">3</span>
          </button>
          <button
            type="button"
            className="nav-lang-btn"
            onClick={() => openModal('langModal')}
            aria-haspopup="dialog"
            aria-label={`Change language, current: ${language}`}
          >
            <i className="bi bi-translate" aria-hidden="true"></i>
            <span>{LANG_CODES[language] || 'EN'}</span>
            <i className="bi bi-chevron-down nav-lang-chev" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            className="nav-hamburger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            aria-controls="navMobilePanel"
          >
            <i className="bi bi-list" aria-hidden="true"></i>
          </button>
          {user ? (
            <button type="button" className="nav-lang-btn" onClick={handleLogout} aria-label={`Signed in as ${user.name} — sign out`}>
              <i className="bi bi-person-check-fill" aria-hidden="true"></i>
              <span>{user.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button type="button" className="nav-lang-btn" onClick={() => openModal('authModal')} aria-haspopup="dialog" aria-label="Sign in or create an account">
              <i className="bi bi-person-fill" aria-hidden="true"></i>
              <span>Sign in</span>
            </button>
          )}
          <div className="coa-chip-web" title="Coat of Arms of Uganda">
            <img
              src="/resources/images/JLOS-logo.png"
              alt="JLOS Justice Portal"
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
            />
          </div>
        </div>
      </nav>

      <div className={`nav-mobile-panel ${mobileOpen ? 'show' : ''}`} id="navMobilePanel">
        {NAV_ITEMS.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`nav-link ${activePage === item.id ? 'active' : ''}`}
            data-nav={item.id}
            aria-current={activePage === item.id ? 'page' : undefined}
            onClick={() => go(item.id)}
          >
            {t(item.labelKey) || item.label}
          </button>
        ))}
      </div>
    </>
  );
}
