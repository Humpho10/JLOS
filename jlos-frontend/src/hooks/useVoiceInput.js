import { useCallback, useEffect, useRef, useState } from 'react';

// ============================================================
// Shared browser-speech-recognition hook — wraps the Web Speech
// API (window.SpeechRecognition / webkitSpeechRecognition) behind
// a simple { listening, toggle } interface so any mic button in
// the app (hero search card, chat input, ...) can drive voice
// input the same way.
//
// Recording runs in `continuous` mode so it does NOT auto-stop the
// moment the browser detects a pause — it keeps listening (and
// live-updating the caller via onTranscript) until the user clicks
// the mic again, at which point onFinish fires with the full
// transcript.
// ============================================================

export function useVoiceInput({ onTranscript, onFinish, onNoSupport, onError, lang = 'en-US' } = {}) {
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
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

    finalTranscriptRef.current = '';
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      const finalText = finalTranscriptRef.current.trim();
      if (finalText) onFinish && onFinish(finalText);
    };
    recognition.onerror = (event) => {
      setListening(false);
      // Manually stopping (or a brief pause with nothing said yet) surfaces
      // as 'aborted'/'no-speech' — that's expected, not a real error.
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        onError && onError();
      }
    };
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      onTranscript && onTranscript((finalTranscriptRef.current + interim).trim());
    };
    recognitionRef.current = recognition;
    recognition.start();
  }, [listening, onTranscript, onFinish, onNoSupport, onError, lang]);

  return { listening, toggle };
}
