import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import FloatingAssistant from './components/FloatingAssistant.jsx';
import ToastHost from './components/ToastHost.jsx';
import HomePage from './pages/HomePage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import InstitutionsPage from './pages/InstitutionsPage.jsx';
import InstitutionContactPage from './pages/InstitutionContactPage.jsx';
import MorePage from './pages/MorePage.jsx';
import NotifModal from './components/modals/NotifModal.jsx';
import LangModal from './components/modals/LangModal.jsx';
import AccessModal from './components/modals/AccessModal.jsx';
import FaqModal from './components/modals/FaqModal.jsx';
import SupportModal from './components/modals/SupportModal.jsx';
import ServicesModal from './components/modals/ServicesModal.jsx';

const PAGES = {
  'page-home': HomePage,
  'page-chat': ChatPage,
  'page-institutions': InstitutionsPage,
  'page-contact': InstitutionContactPage,
  'page-more': MorePage,
};

// These pages lock their own height to the viewport below the navbar
// (see .chat-page-wrap) instead of scrolling as part of the page, so the
// site-wide footer shouldn't render underneath them.
const VIEWPORT_LOCKED_PAGES = new Set(['page-chat', 'page-contact']);

const LANG_TAGS = { English: 'en', Luganda: 'lg', Kiswahili: 'sw', Ateso: 'teo' };

function Shell() {
  const { activePage, isDark, closeAllModals, language } = useApp();

  // Sync the dark-theme class onto <body>, same element the original
  // vanilla version toggled it on.
  useEffect(() => {
    document.body.classList.toggle('theme-dark', isDark);
  }, [isDark]);

  // Keep <html lang> in step with the chosen language so assistive tech
  // announces content with the right pronunciation rules.
  useEffect(() => {
    document.documentElement.lang = LANG_TAGS[language] || 'en';
  }, [language]);

  // Esc closes every open modal — same as the original's single global
  // keydown listener over all `.modal-overlay-web.show` elements.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') closeAllModals();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [closeAllModals]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <Navbar />

      <main id="main-content">
        {Object.entries(PAGES).map(([id, Page]) => (
          <Page key={id} active={activePage === id} />
        ))}
      </main>

      {!VIEWPORT_LOCKED_PAGES.has(activePage) && <Footer />}

      <FloatingAssistant />

      <ToastHost />

      <NotifModal />
      <LangModal />
      <AccessModal />
      <FaqModal />
      <SupportModal />
      <ServicesModal />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
