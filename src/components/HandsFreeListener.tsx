import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { useVoiceEngine } from '@/components/useVoiceEngine';
import { useToast } from '@/components/Toast';

export function HandsFreeListener({ onWake }: { onWake: () => void }) {
  const { state } = useStore();
  const { recognize, stopRecognizing, speak, playChime, recSupported } = useVoiceEngine();
  const { show } = useToast();
  const runningRef = useRef(false);

  useEffect(() => {
    if (!state.voice.handsFree || !state.authed || !recSupported) {
      stopRecognizing();
      runningRef.current = false;
      return;
    }

    let cancelled = false;

    const start = () => {
      if (cancelled || runningRef.current) return;
      runningRef.current = true;
      const ok = recognize((text) => {
        const heard = text.toLowerCase().trim();
        const target = state.voice.wakeWord.toLowerCase().trim();
        if (target && (heard.includes(target) || target.includes(heard))) {
          playChime();
          onWake();
          speak('Listening... How can I assist your recovery today?');
          show({ type: 'success', title: 'Wake word detected', body: `"${state.voice.wakeWord}"` });
        }
      }, () => {
        runningRef.current = false;
        if (!cancelled && state.voice.handsFree) {
          setTimeout(start, 300);
        }
      }, true);
      if (!ok) { runningRef.current = false; }
    };

    start();

    return () => {
      cancelled = true;
      runningRef.current = false;
      stopRecognizing();
    };
  }, [state.voice.handsFree, state.authed, state.voice.wakeWord, recSupported]);

  return null;
}
