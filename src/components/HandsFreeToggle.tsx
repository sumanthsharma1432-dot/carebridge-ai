import { motion } from 'framer-motion';
import { Ear, EarOff } from 'lucide-react';
import { useStore } from '@/store';
import { useVoiceEngine } from '@/components/useVoiceEngine';
import { useToast } from '@/components/Toast';

export function HandsFreeToggle() {
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
          show({ type: 'info', title: 'Voice input unavailable', body: 'Your browser does not support speech recognition.' });
          return;
        }
        updateVoice({ handsFree: !on });
        show({ type: on ? 'info' : 'success', title: on ? 'Hands-Free Mode disabled' : 'Hands-Free Mode enabled', body: on ? 'Background listening is off' : `Say "${state.voice.wakeWord}" to activate` });
      }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full shadow-lg transition ${on ? 'bg-primary-600 text-white' : 'bg-white/90 dark:bg-slate-800/90 text-slate-500 backdrop-blur'}`}
      title="Toggle hands-free voice activation"
    >
      {on ? <Ear size={16} /> : <EarOff size={16} />}
      <span className="text-[11px] font-semibold">{on ? 'Listening' : 'Hands-Free'}</span>
      {on && <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-white" />}
    </motion.button>
  );
}
