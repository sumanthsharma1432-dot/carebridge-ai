import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store';
import { useVoiceEngine, isWakeWord } from '@/components/useVoiceEngine';
import { useToast } from '@/components/Toast';

export function HandsFreeListener({ onWake }: { onWake: () => void }) {
  const { state } = useStore();
  const { t } = useTranslation();
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
        if (isWakeWord(text, state.voice.wakeWord)) {
          playChime();
          onWake();
          speak(t('hands_free.listening_msg'));
          show({ type: 'success', title: t('hands_free.wake_detected'), body: t('hands_free.wake_detected_body', { wakeWord: state.voice.wakeWord }) });
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
  }, [state.voice.handsFree, state.authed, state.voice.wakeWord, recSupported, t, speak, playChime, recognize, stopRecognizing, show, onWake]);

  return null;
}
