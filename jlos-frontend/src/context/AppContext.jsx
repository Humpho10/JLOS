import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { translations } from '../i18n/translations.js';
import { fetchInstitutions, sendInstitutionMessage, ApiError } from '../lib/api.js';

// ============================================================
// Central app state — navigation, theme, modals, toasts,
// language, and the Justice AI chat. Mirrors the original
// prototype's global functions (go, toggleTheme, openModal/
// closeModal, toast, setLanguage, runChatDemo/handleFileAttach/
// startChat/findService) one-for-one, just as React state
// instead of direct DOM manipulation.
//
// The chat itself talks to the jlos-chatbot Laravel API for the
// DPP institution — the only one wired up with real scraped/
// embedded content in this prototype.
// ============================================================

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp() must be used inside <AppProvider>');
  return ctx;
}

const CHAT_INSTITUTION_SLUG = 'dpp';

let uid = 0;
const nextId = () => `m${++uid}`;

function initialMessages() {
  return [
    { id: nextId(), kind: 'system', text: 'Chat started · English · Connected to the DPP assistant' },
    { id: nextId(), kind: 'bot', responder: 'ai', name: 'Justice AI', avatar: '⚖️', text: "Hello! I'm the DPP assistant — ask me anything about the Office of the Director of Public Prosecutions." },
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

  // ---------- chat ----------
  const [messages, setMessages] = useState(initialMessages);
  const [chatStatus, setChatStatus] = useState('● Connecting to DPP assistant...');
  const [chatInput, setChatInput] = useState('');
  const [dppInstitution, setDppInstitution] = useState(null);

  // On load, confirm the backend is reachable and grab the DPP
  // institution's display name/base URL for the chat header.
  useEffect(() => {
    let cancelled = false;
    fetchInstitutions()
      .then((list) => {
        if (cancelled) return;
        const dpp = list.find((inst) => inst.slug === CHAT_INSTITUTION_SLUG);
        setDppInstitution(dpp || null);
        setChatStatus('● Online — usually replies instantly');
      })
      .catch(() => {
        if (cancelled) return;
        setChatStatus('● Assistant unreachable — is the API server running?');
      });
    return () => { cancelled = true; };
  }, []);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { id: nextId(), ...msg }]);
  }, []);
  const addTyping = useCallback(() => {
    setMessages((prev) => [...prev, { id: 'typing', kind: 'typing' }]);
  }, []);
  const removeTyping = useCallback(() => {
    setMessages((prev) => prev.filter((m) => m.id !== 'typing'));
  }, []);

  // `overrideText`, when given, is used instead of the current `chatInput`
  // state — needed by findService(), which sets the input and immediately
  // sends it in the same tick (before React re-renders chatInput).
  const runChatDemo = useCallback((overrideText) => {
    const text = (overrideText !== undefined ? overrideText : chatInput).trim();
    if (!text) return;

    addMessage({ kind: 'user', text });
    setChatInput('');
    setChatStatus('● Justice AI is typing...');
    addTyping();

    sendInstitutionMessage(CHAT_INSTITUTION_SLUG, text)
      .then((reply) => {
        removeTyping();
        addMessage({ kind: 'bot', responder: 'ai', name: 'Justice AI', avatar: '⚖️', text: reply });
        setChatStatus('● Online — usually replies instantly');
      })
      .catch((err) => {
        removeTyping();
        const errText = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
        addMessage({ kind: 'bot', responder: 'ai', name: 'Justice AI', avatar: '⚖️', text: errText });
        setChatStatus('● Online — usually replies instantly');
      });
  }, [chatInput, addMessage, addTyping, removeTyping]);

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
  }, [goToPage]);

  const findService = useCallback((query) => {
    goToPage('page-chat');
    setTimeout(() => {
      setChatInput(query);
      runChatDemo(query);
    }, 300);
  }, [goToPage, runChatDemo]);

  const value = {
    activePage, goToPage,
    isDark, toggleTheme,
    openModal, closeModal, closeAllModals, isModalOpen,
    toasts, pushToast,
    language, setLanguage, t,
    chat: {
      messages, chatStatus, chatInput, setChatInput, dppInstitution,
      runChatDemo, handleFileAttach, startChat, findService,
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
