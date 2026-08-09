import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { translations } from '../i18n/translations.js';
import { fetchInstitutions, fetchCurrentConversation, sendMessageStream, interpretAttachment, truncateConversation, ApiError } from '../lib/api.js';
import { getGuestToken } from '../lib/guestToken.js';
import { fetchMe, register, login, logout, resendVerification } from '../lib/auth.js';

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

// Turns persisted {role, content, created_at} rows back into the shape the
// chat UI already renders, so restored history looks identical to a live
// reply — including its real original timestamp, not the moment it was
// loaded back in.
function historyToMessages(rawMessages) {
  return rawMessages.map((m) => {
    const time = new Date(m.created_at).getTime();
    return m.role === 'user'
      ? { kind: 'user', text: m.content, time }
      : { kind: 'bot', responder: 'ai', name: 'Justice AI', avatar: '⚖️', text: m.content, time };
  });
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
  guestToken,
}) {
  const [messages, setMessages] = useState(initial);
  const [status, setStatus] = useState(idleStatus);
  const [input, setInput] = useState('');
  // Which persisted conversation this session is continuing — null until
  // either restored history is hydrated in, or the first reply comes back
  // carrying the ID of the conversation the backend just created.
  const [conversationId, setConversationId] = useState(null);

  const resolveBotMeta = useCallback(
    () => (getBotMeta ? getBotMeta() : { name: 'Justice AI', avatar: '⚖️' }),
    [getBotMeta]
  );

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { id: nextId(), time: Date.now(), ...msg }]);
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
    setMessages(msgs.map((m) => ({ id: nextId(), time: Date.now(), ...m })));
    setStatus(idleStatus);
    setInput('');
  }, [idleStatus]);

  // Replaces the canned greeting with real restored history on page load —
  // unlike reset(), this also remembers which conversation to keep appending to.
  const hydrate = useCallback((msgs, convId) => {
    setMessages(msgs.map((m) => ({ id: nextId(), time: Date.now(), ...m })));
    setConversationId(convId);
  }, []);

  // `overrideText`, when given, is used instead of the current `input`
  // state — needed by findService()/sendMessage(), which set the input
  // and immediately send it in the same tick (before React re-renders
  // `input`).
  //
  // `displayText`, when given, is shown in the user's chat bubble instead
  // of `text` — needed when an attachment's extracted content is folded
  // into the actual query sent to the AI, so the visible message stays
  // just whatever the user typed instead of that extracted content too.
  // If it resolves empty (a file sent with no caption), no bubble is
  // added at all — the attachment chip already stands for that turn.
  const run = useCallback((overrideText, displayText) => {
    const text = (overrideText !== undefined ? overrideText : input).trim();
    if (!text) return;

    const { name, avatar } = resolveBotMeta();

    const shown = (displayText !== undefined ? displayText : text).trim();
    if (shown) {
      addMessage({ kind: 'user', text: shown });
    }
    setInput('');
    setStatus(typingStatus);
    addTyping();

    // Tokens stream in as they're generated, so the bot message is
    // created on the first chunk and grown in place rather than added
    // all at once.
    let botMessageId = null;
    let messageShown = false;

    streamFn(text, {
      conversationId,
      guestToken,
      onConversationId: setConversationId,
      onDelta: (chunk) => {
        messageShown = true;
        if (botMessageId === null) {
          removeTyping();
          botMessageId = nextId();
          setMessages((prev) => [
            ...prev,
            { id: botMessageId, time: Date.now(), kind: 'bot', responder: 'ai', name, avatar, text: chunk },
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
  }, [input, streamFn, resolveBotMeta, addMessage, addTyping, removeTyping, appendToMessage, typingStatus, idleStatus, conversationId, guestToken]);

  // Edits a past question in place: drops it and everything after it (both
  // here and, if this session is backed by a real persisted conversation,
  // on the server too — otherwise the AI's next reply would still be
  // shaped by the un-edited version), then resends the edited text as a
  // fresh turn via the normal run() flow.
  const editMessage = useCallback((id, newText) => {
    const text = newText.trim();
    if (!text) return;

    const idx = messages.findIndex((m) => m.id === id);
    if (idx === -1) return;

    const target = messages[idx];
    if (conversationId && target.time) {
      truncateConversation(conversationId, new Date(target.time).toISOString(), guestToken).catch(() => {
        // Best-effort — the visible chat still updates below even if this
        // fails, so a flaky request here shouldn't block editing.
      });
    }

    setMessages((prev) => prev.slice(0, idx));
    run(text);
  }, [messages, conversationId, guestToken, run]);

  return {
    messages, status, setStatus,
    input, setInput,
    addMessage, addTyping, removeTyping, appendToMessage,
    run, reset, hydrate, editMessage,
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
  // Persisted so a returning visitor doesn't land back in light mode after
  // explicitly switching to dark (or vice versa).
  const [isDark, setIsDark] = useState(() => localStorage.getItem('jlos_theme') === 'dark');
  const toggleTheme = useCallback(() => {
    setIsDark((d) => {
      const next = !d;
      localStorage.setItem('jlos_theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

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
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const pushToast = useCallback((msg) => {
    const id = nextId();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => dismissToast(id), 2850);
  }, [dismissToast]);

  // The verification email link redirects here with ?verified=1/0 once the
  // backend has processed it — surface that as a toast, then drop the param
  // so a refresh doesn't repeat it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('verified')) return;
    pushToast(params.get('verified') === '1' ? 'Email verified — thank you!' : 'That verification link is invalid or expired.');
    params.delete('verified');
    const rest = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (rest ? `?${rest}` : ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- language ----------
  // Persisted the same way as theme — a returning visitor keeps whatever
  // language they picked instead of it silently reverting to English.
  const [language, setLanguageState] = useState(() => localStorage.getItem('jlos_language') || 'English');
  const setLanguage = useCallback((name) => {
    setLanguageState(name);
    localStorage.setItem('jlos_language', name);
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
  // Guests get a random token on first visit, kept in localStorage, so a
  // refresh can be matched back to the same conversation without an account.
  const [guestToken] = useState(() => getGuestToken());

  const generalChat = useChatSession({
    streamFn: sendMessageStream,
    initialMessages: initialMessages(),
    guestToken,
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

  // ---------- account ----------
  const [user, setUser] = useState(null);

  // Check for an existing signed-in session on load (a token left over in
  // localStorage from a previous visit).
  useEffect(() => {
    let cancelled = false;
    fetchMe().then((u) => { if (!cancelled) setUser(u); });
    return () => { cancelled = true; };
  }, []);

  const handleRegister = useCallback(async (form) => {
    const u = await register(form);
    setUser(u);
    pushToast(`Welcome, ${u.name}! Check your email to verify your account.`);
  }, [pushToast]);

  const handleLogin = useCallback(async (form) => {
    const u = await login(form);
    setUser(u);
    pushToast(`Welcome back, ${u.name}.`);
  }, [pushToast]);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    pushToast('Signed out.');
  }, [pushToast]);

  const handleResendVerification = useCallback(() => {
    resendVerification()
      .then(() => pushToast('Verification email sent — check your inbox.'))
      .catch(() => pushToast('Could not send that right now. Please try again.'));
  }, [pushToast]);

  // Restore the signed-in-user's or guest's last conversation, so a refresh
  // (or a login, which switches identity from guest_token to user_id) picks
  // up the right history instead of always starting fresh.
  useEffect(() => {
    let cancelled = false;
    fetchCurrentConversation(guestToken)
      .then((data) => {
        if (cancelled || !data.conversation_id || !data.messages?.length) return;
        generalChat.hydrate(
          [
            { kind: 'system', text: 'Chat started · English · Connected to Justice AI' },
            ...historyToMessages(data.messages),
          ],
          data.conversation_id
        );
      })
      .catch(() => { /* no history yet, or unreachable — already toasted above */ });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guestToken, user]);

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

  // Attaching a file no longer sends it immediately — it just sits as a
  // pending attachment (shown as a preview chip in the compose area) until
  // the user actually hits send, the same way ChatGPT lets you add a
  // caption/question alongside a file before it goes out.
  const [pendingAttachment, setPendingAttachment] = useState(null);

  const attachFile = useCallback((file) => {
    if (!file) return;

    const isImage = file.type && file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) {
      pushToast("Justice AI can read images and PDFs — that file type isn't supported yet.");
      return;
    }

    const sizeLabel = formatSize(file.size);
    const url = isImage ? URL.createObjectURL(file) : null;
    const typeLabel = isPdf ? 'PDF' : (file.type.split('/')[1] || 'FILE').toUpperCase();
    setPendingAttachment((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return { file, isImage, url, name: file.name, sizeLabel, typeLabel };
    });
  }, [pushToast]);

  const clearAttachment = useCallback(() => {
    setPendingAttachment((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
  }, []);

  // The actual send action for the chat page — plain text works exactly
  // like generalChat.run() always did; a pending attachment gets described
  // first (via the interpret endpoint) and merged with whatever the user
  // typed alongside it, so "photo + a question about it" goes out as one turn.
  const sendMessage = useCallback((overrideText) => {
    const typedText = (overrideText !== undefined ? overrideText : generalChat.input).trim();

    if (!pendingAttachment) {
      if (!typedText) return;
      generalChat.run(overrideText);
      return;
    }

    const attachment = pendingAttachment;
    generalChat.addMessage({ kind: 'file-msg', isImage: attachment.isImage, url: attachment.url, name: attachment.name, sizeLabel: attachment.sizeLabel });
    generalChat.setInput('');
    setPendingAttachment(null);
    generalChat.setStatus('● Justice AI is reading the attachment...');
    generalChat.addTyping();

    interpretAttachment(attachment.file)
      .then((content) => {
        generalChat.removeTyping();
        generalChat.setStatus('● Online — usually replies instantly');
        // The AI sees the caption plus the file's real content; the chat
        // bubble only ever shows the caption (or nothing, if there wasn't
        // one) — the attachment chip already represents the file itself.
        const query = typedText
          ? `${typedText}\n\nAttached file content:\n${content}`
          : `Attached file content:\n${content}`;
        generalChat.run(query, typedText);
      })
      .catch((err) => {
        generalChat.removeTyping();
        generalChat.setStatus('● Online — usually replies instantly');
        const errText = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
        generalChat.addMessage({ kind: 'bot', responder: 'ai', name: 'Justice AI', avatar: '⚖️', text: errText });
      });
  }, [generalChat, pendingAttachment]);

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

  const value = {
    activePage, goToPage,
    isDark, toggleTheme,
    openModal, closeModal, closeAllModals, isModalOpen,
    toasts, pushToast, dismissToast,
    language, setLanguage, t,
    chat: {
      messages: generalChat.messages, chatStatus: generalChat.status,
      chatInput: generalChat.input, setChatInput: generalChat.setInput,
      sendMessage, startChat, findService,
      editMessage: generalChat.editMessage,
      pendingAttachment, attachFile, clearAttachment,
    },
    activeInstitution, goToInstitutionContact,
    institutionChat: {
      messages: institutionChat.messages, status: institutionChat.status,
      input: institutionChat.input, setInput: institutionChat.setInput,
      run: institutionChat.run,
    },
    user, handleRegister, handleLogin, handleLogout, handleResendVerification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}