import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================
// Shared browser-speech-recognition hook — wraps the Web Speech
// API (window.SpeechRecognition / webkitSpeechRecognition) behind
// a simple { listening, toggle } interface so any mic button in
// the app (hero search card, chat input, ...) can drive voice
// input the same way.
// ============================================================

export function useVoiceInput({ onResult, onInterimResult, onNoSupport, onError, lang = 'en-US' } = {}) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  useEffect(() => () => {
    recognitionRef.current && recognitionRef.current.stop();
  }, []);

  const toggle = useCallback(() => {
    const SpeechRecognition = typeof window !== 'undefined'
      && (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      onNoSupport && onNoSupport();
      return;
    }
    if (listening) {
      recognitionRef.current && recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      onError && onError();
    };
    recognition.onresult = (event) => {
      let transcript = '';
      let isFinal = false;

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) isFinal = true;
      }

      if (isFinal) {
        onResult && onResult(transcript);
      } else {
        onInterimResult && onInterimResult(transcript);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [listening, onResult, onInterimResult, onNoSupport, onError, lang]);

  return { listening, toggle };
}
