import { motion } from 'framer-motion';
import { Ear, EarOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store';
import { useVoiceEngine } from '@/components/useVoiceEngine';
import { useToast } from '@/components/Toast';

export function HandsFreeToggle() {
  const { t } = useTranslation();
  const { state } = useStore();
  const { updateVoice, recSupported } = useVoiceEngine();
  const { show } = useToast();

  if (!state.authed) return null;

  const on = state.voice.handsFree;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        if (!recSupported && !on) {
          show({ type: 'info', title: t('hands_free.voice_unavailable'), body: t('hands_free.browser_no_rec') });
          return;
        }
        updateVoice({ handsFree: !on });
        show({ type: on ? 'info' : 'success', title: on ? t('hands_free.disabled') : t('hands_free.enabled'), body: on ? t('hands_free.background_off') : t('hands_free.say_activate', { wakeWord: state.voice.wakeWord }) });
      }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full shadow-lg transition ${on ? 'bg-primary-600 text-white' : 'bg-white/90 dark:bg-slate-800/90 text-slate-500 backdrop-blur'}`}
      title={t('hands_free.toggle_title')}
    >
      {on ? <Ear size={16} /> : <EarOff size={16} />}
      <span className="text-[11px] font-semibold">{on ? t('hands_free.listening') : t('hands_free.hands_free')}</span>
      {on && <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-white" />}
    </motion.button>
  );
}
