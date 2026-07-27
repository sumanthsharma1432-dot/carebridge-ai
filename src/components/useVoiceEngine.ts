import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store';

const LANG_MAP: Record<string, string> = {
  en: 'en-US', es: 'es-ES', hi: 'hi-IN', fr: 'fr-FR', de: 'de-DE',
  English: 'en-US', Spanish: 'es-ES', French: 'fr-FR', German: 'de-DE', Hindi: 'hi-IN',
};

export function getSpeechLang(language: string): string {
  return LANG_MAP[language?.slice(0, 2)] || LANG_MAP[language] || 'en-US';
}

export function useVoiceEngine() {
  const { state, update } = useStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recSupported, setRecSupported] = useState(true);
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) { setSpeechSupported(false); return; }
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setRecSupported(!!SR);
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = getSpeechLang(state.language);
    u.pitch = state.voice.pitch;
    u.rate = state.voice.rate;
    if (state.voice.voiceName) {
      const v = voices.find(v => v.name === state.voice.voiceName);
      if (v) u.voice = v;
    }
    u.onend = () => onEnd?.();
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  }, [state.language, state.voice, voices]);

  const stopSpeaking = useCallback(() => { window.speechSynthesis?.cancel(); }, []);

  const recognize = useCallback((onResult: (text: string) => void, onEnd?: () => void, continuous = false): boolean => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return false;
    try { recRef.current?.stop(); } catch {}
    const rec = new SR();
    rec.lang = getSpeechLang(state.language);
    rec.interimResults = false;
    rec.continuous = continuous;
    rec.onresult = (e: any) => {
      const txt = e.results[e.results.length - 1][0].transcript;
      onResult(txt);
    };
    rec.onend = () => onEnd?.();
    rec.onerror = () => onEnd?.();
    recRef.current = rec;
    try { rec.start(); return true; } catch { return false; }
  }, [state.language]);

  const stopRecognizing = useCallback(() => { try { recRef.current?.stop(); } catch {} }, []);

  const updateVoice = useCallback((patch: Partial<typeof state.voice>) => {
    update({ voice: { ...state.voice, ...patch } });
  }, [state.voice, update]);

  const playChime = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }, []);

  return { voices, speechSupported, recSupported, speak, stopSpeaking, recognize, stopRecognizing, updateVoice, playChime, state };
}
