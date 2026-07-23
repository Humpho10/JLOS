import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { translations } from '../i18n/translations.js';
import { fetchInstitutions, sendMessageStream, interpretAttachment, ApiError } from '../lib/api.js';

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

// ------------------------------------------------------------
// useChatSession — shared engine behind both the general Justice
// AI chat and the per-institution "contact" chat. Owns messages,
// status, and the current input, and knows how to stream a reply
// from whatever `streamFn(text, { onDelta, onError })` it's given.
//
// `getBotMeta` lets callers customize who the "bot" bubble is
// attributed to (Justice AI vs. a specific institution) — it's
// re-resolved on every run() so it always reflects the latest
// caller-side state (e.g. the currently active institution).
// ------------------------------------------------------------
function useChatSession({
  streamFn,
  initialMessages: initial = [],
  typingStatus = '● Justice AI is typing...',
  idleStatus = '● Online — usually replies instantly',
  getBotMeta,
}) {
  const [messages, setMessages] = useState(initial);
  const [status, setStatus] = useState(idleStatus);
  const [input, setInput] = useState('');

  const resolveBotMeta = useCallback(
    () => (getBotMeta ? getBotMeta() : { name: 'Justice AI', avatar: '⚖️' }),
    [getBotMeta]
  );

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { id: nextId(), ...msg }]);
  }, []);
  const addTyping = useCallback(() => {
    setMessages((prev) => [...prev, { id: 'typing', kind: 'typing' }]);
  }, []);
  const removeTyping = useCallback(() => {
    setMessages((prev) => prev.filter((m) => m.id !== 'typing'));
  }, []);
  const appendToMessage = useCallback((id, chunk) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text: m.text + chunk } : m)));
  }, []);

  const reset = useCallback((msgs) => {
    setMessages(msgs.map((m) => ({ id: nextId(), ...m })));
    setStatus(idleStatus);
    setInput('');
  }, [idleStatus]);

  // `overrideText`, when given, is used instead of the current `input`
  // state — needed by findService()/handleFileAttach(), which set the
  // input and immediately send it in the same tick (before React
  // re-renders `input`).
  const run = useCallback((overrideText) => {
    const text = (overrideText !== undefined ? overrideText : input).trim();
    if (!text) return;

    const { name, avatar } = resolveBotMeta();

    addMessage({ kind: 'user', text });
    setInput('');
    setStatus(typingStatus);
    addTyping();

    // Tokens stream in as they're generated, so the bot message is
    // created on the first chunk and grown in place rather than added
    // all at once.
    let botMessageId = null;
    let messageShown = false;

    streamFn(text, {
      onDelta: (chunk) => {
        messageShown = true;
        if (botMessageId === null) {
          removeTyping();
          botMessageId = nextId();
          setMessages((prev) => [
            ...prev,
            { id: botMessageId, kind: 'bot', responder: 'ai', name, avatar, text: chunk },
          ]);
        } else {
          appendToMessage(botMessageId, chunk);
        }
      },
      onError: (message) => {
        messageShown = true;
        if (botMessageId === null) {
          removeTyping();
          addMessage({ kind: 'bot', responder: 'ai', name, avatar, text: message });
        } else {
          appendToMessage(botMessageId, `\n\n${message}`);
        }
      },
    })
      .catch(() => {
        messageShown = true;
        removeTyping();
        addMessage({ kind: 'bot', responder: 'ai', name, avatar, text: 'Something went wrong. Please try again.' });
      })
      .finally(() => {
        if (!messageShown) {
          removeTyping();
          addMessage({
            kind: 'bot', responder: 'ai', name, avatar,
            text: "I couldn't find relevant information for that — try rephrasing your question.",
          });
        }
        setStatus(idleStatus);
      });
  }, [input, streamFn, resolveBotMeta, addMessage, addTyping, removeTyping, appendToMessage, typingStatus, idleStatus]);

  return {
    messages, status, setStatus,
    input, setInput,
    addMessage, addTyping, removeTyping, appendToMessage,
    run, reset,
  };
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

  // ---------- general Justice AI chat ----------
  const generalChat = useChatSession({
    streamFn: sendMessageStream,
    initialMessages: initialMessages(),
  });

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

  const startChat = useCallback((text) => {
    goToPage('page-chat');
    setTimeout(() => generalChat.setInput(text), 50);
  }, [goToPage, generalChat]);

  const findService = useCallback((query) => {
    goToPage('page-chat');
    setTimeout(() => {
      generalChat.setInput(query);
      generalChat.run(query);
    }, 300);
  }, [goToPage, generalChat]);

  // Reads the attached image/PDF into a short description and feeds it
  // through the same run() flow as typed or spoken input — the same
  // "whatever gets you text into the box becomes the query" pattern
  // used by voice input.
  const handleFileAttach = useCallback((file) => {
    if (!file) return;

    const isImage = file.type && file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) {
      pushToast("Justice AI can read images and PDFs — that file type isn't supported yet.");
      return;
    }

    const sizeLabel = formatSize(file.size);
    const url = isImage ? URL.createObjectURL(file) : null;
    generalChat.addMessage({ kind: 'file-msg', isImage, url, name: file.name, sizeLabel });
    generalChat.setStatus('● Justice AI is reading the attachment...');
    generalChat.addTyping();

    interpretAttachment(file)
      .then((description) => {
        generalChat.removeTyping();
        generalChat.setStatus('● Online — usually replies instantly');
        generalChat.setInput(description);
        generalChat.run(description);
      })
      .catch((err) => {
        generalChat.removeTyping();
        generalChat.setStatus('● Online — usually replies instantly');
        const errText = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
        generalChat.addMessage({ kind: 'bot', responder: 'ai', name: 'Justice AI', avatar: '⚖️', text: errText });
      });
  }, [generalChat, pushToast]);

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
    getBotMeta: () => ({
      name: activeInstitution?.short || activeInstitution?.name || 'Support',
      avatar: '⚖️',
    }),
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
      chatInput: generalChat.input, setChatInput: generalChat.setInput,
      runChatDemo: generalChat.run, handleFileAttach, startChat, findService,
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