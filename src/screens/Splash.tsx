import { motion } from 'framer-motion';
import { Heart, Activity, ShieldCheck, Mic, BrainCircuit, Watch } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from '@/router';

export function Splash() {
  const { navigate } = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white p-8">
      <motion.div
        initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 120 }}
        className="w-24 h-24 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center mb-6 shadow-2xl"
      >
        <Heart size={52} className="text-white" fill="white" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-4xl font-extrabold tracking-tight"
      >
        CareBridge AI
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-primary-100 mt-2 text-center"
      >
        Post-Discharge & Recovery Tracker
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        onClick={() => navigate('onboarding')}
        className="mt-12 bg-white text-primary-700 font-bold rounded-2xl px-10 py-3.5 shadow-xl active:scale-95 transition"
      >
        Get Started
      </motion.button>
    </div>
  );
}

const slides = [
  {
    icon: Mic, color: 'from-blue-500 to-cyan-400',
    title: 'Voice Check-ins',
    desc: 'Just speak how you feel. Our AI listens, understands pain levels, mood, and symptoms — automatically.',
  },
  {
    icon: BrainCircuit, color: 'from-amber-500 to-orange-500',
    title: 'AI Risk Alerts',
    desc: 'Real-time risk scoring flags complications early — before they become emergencies.',
  },
  {
    icon: Watch, color: 'from-emerald-500 to-green-400',
    title: 'Wearable Sync',
    desc: 'Apple Watch, Fitbit, and more. Vitals sync automatically for continuous recovery tracking.',
  },
];

export function Onboarding() {
  const { navigate } = useRouter();
  const [i, setI] = useState(0);
  const slide = slides[i];
  const next = () => (i < 2 ? setI(i + 1) : navigate('login'));

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <div className="flex justify-end p-4">
        <button onClick={() => navigate('login')} className="text-sm text-slate-400 font-medium">Skip</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring' }}
          className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center mb-10 shadow-2xl`}
        >
          <slide.icon size={64} className="text-white" />
        </motion.div>
        <motion.h2 key={`t${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-extrabold text-slate-800 dark:text-white mb-3">
          {slide.title}
        </motion.h2>
        <motion.p key={`d${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
          {slide.desc}
        </motion.p>
      </div>
      <div className="p-8">
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, idx) => (
            <div key={idx} className={`h-2 rounded-full transition-all ${idx === i ? 'w-8 bg-primary-600' : 'w-2 bg-slate-300 dark:bg-slate-700'}`} />
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={next}
          className="w-full bg-primary-600 text-white font-bold rounded-2xl py-4 shadow-glow">
          {i < 2 ? 'Continue' : 'Get Started'}
        </motion.button>
      </div>
    </div>
  );
}
