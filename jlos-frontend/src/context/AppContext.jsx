import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { translations } from '../i18n/translations.js';
import { fetchInstitutions, sendMessageStream } from '../lib/api.js';
import { useChatSession } from '../hooks/useChatSession.js';

// ============================================================
// Central app state — navigation, theme, modals, toasts,
// language, and the Justice AI chat. Mirrors the original
// prototype's global functions (go, toggleTheme, openModal/
// closeModal, toast, setLanguage, runChatDemo/handleFileAttach/
// startChat/findService) one-for-one, just as React state
// instead of direct DOM manipulation.
//
// The chat itself talks to the jlos-chatbot Laravel API's
// institution-agnostic /api/chat endpoint, which searches across
// every institution's scraped/embedded content and answers based
// on whichever one the question is actually about.
// ============================================================

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp() must be used inside <AppProvider>');
  return ctx;
}

let uid = 0;
const nextId = () => `m${++uid}`;

function initialMessages() {
  return [
    { id: nextId(), kind: 'system', text: 'Chat started · English · Connected to Justice AI' },
    { id: nextId(), kind: 'bot', responder: 'ai', name: 'Justice AI', avatar: '⚖️', text: "Hello! I'm Justice AI — ask me anything about JLOS institutions like the DPP or the Uganda Human Rights Commission." },
  ];
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  const kb = bytes / 1024;
  if (kb < 1024) return Math.max(1, Math.round(kb)) + ' KB';
  return (kb / 1024).toFixed(1) + ' MB';
}

export function AppProvider({ children }) {
  // ---------- navigation ----------
  const [activePage, setActivePage] = useState('page-home');
  const goToPage = useCallback((id) => {
    setActivePage(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ---------- theme ----------
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);

  // ---------- modals ----------
  const [openModalIds, setOpenModalIds] = useState(() => new Set());
  const openModal = useCallback((id) => {
    setOpenModalIds((prev) => new Set(prev).add(id));
  }, []);
  const closeModal = useCallback((id) => {
    setOpenModalIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);
  const closeAllModals = useCallback(() => setOpenModalIds(new Set()), []);
  const isModalOpen = useCallback((id) => openModalIds.has(id), [openModalIds]);

  // ---------- toast ----------
  const [toasts, setToasts] = useState([]);
  const pushToast = useCallback((msg) => {
    const id = nextId();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2850);
  }, []);

  // ---------- language ----------
  const [language, setLanguageState] = useState('English');
  const setLanguage = useCallback((name) => {
    setLanguageState(name);
    setTimeout(() => {
      closeModal('langModal');
      pushToast('Language set to ' + name);
    }, 200);
  }, [closeModal, pushToast]);

  // t(key) looks up `key` in the translations dictionary for the
  // active language, falling back to English and then the raw key
  // itself if a string hasn't been translated yet.
  const t = useCallback((key) => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.English || key;
  }, [language]);

  // ---------- general chat ----------
  const generalChat = useChatSession({
    streamFn: sendMessageStream,
    initialMessages: initialMessages(),
  });
  const { setInput: setChatInput, run: runChatDemo, addMessage } = generalChat;

  // On load, just confirm the backend is reachable.
  useEffect(() => {
    let cancelled = false;
    fetchInstitutions()
      .then(() => { /* reachable — session already starts in the idle status */ })
      .catch(() => {
        if (cancelled) return;
        pushToast('Assistant unreachable — is the API server running?');
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileAttach = useCallback((file) => {
    if (!file) return;
    const isImage = file.type && file.type.startsWith('image/');
    const sizeLabel = formatSize(file.size);
    const url = isImage ? URL.createObjectURL(file) : null;
    addMessage({ kind: 'file-msg', isImage, url, name: file.name, sizeLabel });
    addMessage({
      kind: 'bot', responder: 'ai', name: 'Justice AI', avatar: '⚖️',
      text: "Thanks for sharing that — this prototype doesn't read attached files yet, so please describe what's in it and I'll help from there.",
    });
  }, [addMessage]);

  const startChat = useCallback((text) => {
    goToPage('page-chat');
    setTimeout(() => setChatInput(text), 50);
  }, [goToPage, setChatInput]);

  const findService = useCallback((query) => {
    goToPage('page-chat');
    setTimeout(() => {
      setChatInput(query);
      runChatDemo(query);
    }, 300);
  }, [goToPage, setChatInput, runChatDemo]);

  // ---------- institution contact page ----------
  // This is a "message this institution" channel, not the AI — sending a
  // message here doesn't call the AI backend at all. There's no real
  // ticketing/email backend yet, so delivery is simulated locally: the
  // message is captured, and a canned confirmation is shown after a short
  // delay to make the wait feel real.
  const [activeInstitution, setActiveInstitution] = useState(null);

  const contactStreamFn = useCallback((text, { onDelta }) => {
    const inst = activeInstitution;
    return new Promise((resolve) => {
      setTimeout(() => {
        onDelta(
          `Thanks — your message has been sent to ${inst?.short || inst?.name}. `
          + `They typically respond within 1–2 business days. If it's urgent, call ${inst?.phone}.`
        );
        resolve();
      }, 900);
    });
  }, [activeInstitution]);

  const institutionChat = useChatSession({
    streamFn: contactStreamFn,
    initialMessages: [],
    typingStatus: '● Sending...',
  });

  const goToInstitutionContact = useCallback((inst) => {
    setActiveInstitution(inst);
    institutionChat.reset([
      { kind: 'system', text: `Contacting ${inst.name}` },
      { kind: 'bot', responder: 'ai', name: inst.short || inst.name, avatar: '⚖️', text: `Send a message below and it'll go straight to ${inst.short || inst.name}, or call ${inst.phone} to speak with someone directly.` },
    ]);
    goToPage('page-contact');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goToPage]);

  // ---------- institution directory focus ----------
  // Tapping an institution elsewhere (e.g. the home page pills) jumps to the
  // directory with that institution's card already expanded, instead of
  // just dropping the user on the generic unfiltered list.
  const [focusInstitutionCode, setFocusInstitutionCode] = useState(null);
  const goToInstitution = useCallback((code) => {
    setFocusInstitutionCode(code);
    goToPage('page-institutions');
  }, [goToPage]);

  const value = {
    activePage, goToPage,
    isDark, toggleTheme,
    openModal, closeModal, closeAllModals, isModalOpen,
    toasts, pushToast,
    language, setLanguage, t,
    chat: {
      messages: generalChat.messages, chatStatus: generalChat.status,
      chatInput: generalChat.input, setChatInput,
      runChatDemo, handleFileAttach, startChat, findService,
    },
    activeInstitution, goToInstitutionContact,
    institutionChat: {
      messages: institutionChat.messages, status: institutionChat.status,
      input: institutionChat.input, setInput: institutionChat.setInput,
      run: institutionChat.run,
    },
    focusInstitutionCode, goToInstitution,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
