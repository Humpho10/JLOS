import { useCallback, useState } from 'react';

// ============================================================
// Reusable streamed-chat state: message list, status line, input,
// and a run() that streams tokens in and grows the bot message in
// place. Used for both the general Justice AI chat and each
// institution contact page's scoped chat — they only differ in
// which streaming function they call and their initial greeting.
// ============================================================

let uid = 0;
const nextId = () => `m${++uid}`;

export function useChatSession({
  streamFn,
  initialMessages,
  botName = 'Justice AI',
  botAvatar = '⚖️',
  idleStatus = '● Online — usually replies instantly',
  typingStatus = '● Justice AI is typing...',
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [status, setStatus] = useState(idleStatus);
  const [input, setInput] = useState('');

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

  // `overrideText`, when given, is used instead of the current `input`
  // state — needed by callers that set the input and immediately send it
  // in the same tick (before React re-renders the input state).
  const run = useCallback((overrideText) => {
    const text = (overrideText !== undefined ? overrideText : input).trim();
    if (!text) return;

    addMessage({ kind: 'user', text });
    setInput('');
    setStatus(typingStatus);
    addTyping();

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
            { id: botMessageId, kind: 'bot', responder: 'ai', name: botName, avatar: botAvatar, text: chunk },
          ]);
        } else {
          appendToMessage(botMessageId, chunk);
        }
      },
      onError: (message) => {
        messageShown = true;
        if (botMessageId === null) {
          removeTyping();
          addMessage({ kind: 'bot', responder: 'ai', name: botName, avatar: botAvatar, text: message });
        } else {
          appendToMessage(botMessageId, `\n\n${message}`);
        }
      },
    })
      .catch(() => {
        messageShown = true;
        removeTyping();
        addMessage({ kind: 'bot', responder: 'ai', name: botName, avatar: botAvatar, text: 'Something went wrong. Please try again.' });
      })
      .finally(() => {
        if (!messageShown) {
          removeTyping();
          addMessage({
            kind: 'bot', responder: 'ai', name: botName, avatar: botAvatar,
            text: "I couldn't find relevant information for that — try rephrasing your question.",
          });
        }
        setStatus(idleStatus);
      });
  }, [input, streamFn, addMessage, addTyping, removeTyping, appendToMessage, botName, botAvatar, idleStatus, typingStatus]);

  // `msgs` are plain message objects without ids — reset assigns them,
  // same as addMessage does, so callers don't need their own id generator.
  const reset = useCallback((msgs) => {
    setMessages(msgs.map((m) => ({ id: nextId(), ...m })));
    setStatus(idleStatus);
    setInput('');
  }, [idleStatus]);

  return { messages, status, input, setInput, run, addMessage, reset };
}
