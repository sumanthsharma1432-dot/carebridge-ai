import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Sparkles, Volume2, AlertTriangle, Pill, Activity, Send, VolumeX } from 'lucide-react';
import { useStore } from '@/store';
import { useToast } from '@/components/Toast';
import { useRouter } from '@/router';
import { useVoiceEngine, stripWakeWord } from '@/components/useVoiceEngine';

type Phase = 'idle' | 'listening' | 'thinking' | 'speaking';

interface Msg { id: string; from: 'user' | 'ai'; text: string }

export function VoiceAssistant({ externalOpen, onExternalOpenChange }: { externalOpen?: boolean; onExternalOpenChange?: (open: boolean) => void }) {
  const { t } = useTranslation();
  const { state, setState } = useStore();
  const { show } = useToast();
  const { navigate } = useRouter();
  const { speak, stopSpeaking, recognize, stopRecognizing, recSupported, speechLang } = useVoiceEngine();

  const FAQ: { match: string[]; reply: string }[] = [
    { match: ['shower', 'bath', 'wash'], reply: t('voice_assistant.faq_shower') },
    { match: ['eat', 'food', 'diet', 'nutrition'], reply: t('voice_assistant.faq_diet') },
    { match: ['medication', 'take my med', 'how do i take', 'pill', 'medicine'], reply: t('voice_assistant.faq_medication') },
    { match: ['incision', 'wound', 'stitches', 'scar'], reply: t('voice_assistant.faq_incision') },
    { match: ['exercise', 'walk', 'move', 'activity'], reply: t('voice_assistant.faq_exercise') },
    { match: ['sleep', 'rest', 'tired'], reply: t('voice_assistant.faq_sleep') },
    { match: ['fever', 'temperature', 'hot'], reply: t('voice_assistant.faq_fever') },
    { match: ['constipation', 'bowel', 'digestion'], reply: t('voice_assistant.faq_constipation') },
  ];

  const generateReply = (query: string, patient: any): string => {
    const lower = query.toLowerCase();
    for (const f of FAQ) {
      if (f.match.some(m => lower.includes(m))) return f.reply;
    }
    if (lower.includes('recovery') || lower.includes('how am i') || lower.includes('doing')) {
      return t('voice_assistant.reply_recovery', { score: patient.recoveryScore, day: patient.recoveryDay });
    }
    if (lower.includes('pain') || lower.includes('hurt')) {
      const sev = lower.includes('severe') || lower.includes('bad') || lower.includes('a lot') || lower.includes('high');
      return sev
        ? t('voice_assistant.reply_pain_severe')
        : t('voice_assistant.reply_pain_mild');
    }
    if (lower.includes('next') && (lower.includes('med') || lower.includes('pill'))) {
      const next = patient.medications.find((m: any) => !m.taken);
      return next
        ? t('voice_assistant.reply_next_med', { name: next.name, dosage: next.dosage, time: next.time, instructions: next.instructions })
        : t('voice_assistant.reply_all_meds');
    }
    if (lower.includes('medication') || lower.includes('med') || lower.includes('pill')) {
      const next = patient.medications.find((m: any) => !m.taken);
      return next
        ? t('voice_assistant.reply_next_med', { name: next.name, dosage: next.dosage, time: next.time, instructions: next.instructions })
        : t('voice_assistant.reply_all_meds');
    }
    if (lower.includes('vital') || lower.includes('heart') || lower.includes('blood')) {
      return t('voice_assistant.reply_vitals', { hr: patient.vitals.heartRate, bp: patient.vitals.bloodPressure, oxygen: patient.vitals.oxygen });
    }
    if (lower.includes('appointment') || lower.includes('doctor')) {
      return t('voice_assistant.reply_appointment', { date: patient.nextAppointment.date, time: patient.nextAppointment.time, doctor: patient.nextAppointment.doctor, type: patient.nextAppointment.type });
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return t('voice_assistant.reply_hello');
    }
    return t('voice_assistant.reply_fallback');
  };

  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (v: boolean) => { if (onExternalOpenChange) onExternalOpenChange(v); else setInternalOpen(v); };
  const [phase, setPhase] = useState<Phase>('idle');
  const [transcript, setTranscript] = useState('');
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 'init', from: 'ai', text: t('voice_assistant.init_msg') },
  ]);
  const recRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [msgs]);

  const addMsg = (from: 'user' | 'ai', text: string) => setMsgs(p => [...p, { id: Date.now() + '-' + from + '-' + Math.random(), from, text }]);

  const processQuery = useCallback((query: string) => {
    const p = state.patients[0];
    const reply = generateReply(query, p);
    addMsg('user', query);
    setPhase('thinking');
    setTimeout(() => {
      addMsg('ai', reply);
      const lower = query.toLowerCase();
      if (lower.includes('pain') && (lower.includes('severe') || lower.includes('bad') || lower.includes('high'))) {
        setState(s => ({ ...s, alerts: [{ id: 'va' + Date.now(), patientId: p.id, type: 'Voice Alert', level: 'high', time: 'now', message: t('voice_assistant.pain_alert') }, ...s.alerts] }));
        show({ type: 'error', title: t('voice_assistant.high_risk_flagged'), body: t('voice_assistant.care_team_notified') });
        p.emergencyContacts.forEach((c: any) => show({ type: 'sms', title: t('voice_assistant.sms_sent_name', { name: c.name }), body: c.phone }));
        setTimeout(() => navigate('sos'), 1500);
      }
      speak(reply, () => setPhase('idle'));
      setPhase('speaking');
    }, 700);
  }, [state.patients, setState, show, navigate, speak, t]);

  const startListening = () => {
    if (!recSupported) {
      show({ type: 'info', title: t('voice_assistant.voice_unavailable'), body: t('voice_assistant.browser_no_rec') });
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = speechLang;
    rec.interimResults = false; rec.continuous = false;
    rec.onresult = (e: any) => {
      const raw = e.results[0][0].transcript;
      const txt = stripWakeWord(raw);
      setTranscript(txt);
      if (txt) processQuery(txt);
    };
    rec.onend = () => setPhase(p => p === 'listening' ? 'idle' : p);
    rec.onerror = () => setPhase('idle');
    recRef.current = rec;
    try { rec.start(); setPhase('listening'); setTranscript(''); } catch { setPhase('idle'); }
  };

  const stopListening = () => { try { recRef.current?.stop(); } catch {} setPhase('idle'); };

  const sendText = () => {
    const q = text.trim();
    if (!q) return;
    setText('');
    processQuery(q);
  };

  const speakMsg = (msg: Msg) => {
    setPhase('speaking');
    speak(msg.text, () => setPhase('idle'));
  };

  const close = () => { setOpen(false); stopSpeaking(); stopRecognizing(); setPhase('idle'); };

  const quickPrompts = [
    { label: t('voice_assistant.prompt_recovery'), q: t('voice_assistant.q_recovery'), icon: Activity },
    { label: t('voice_assistant.prompt_next_med'), q: t('voice_assistant.q_next_med'), icon: Pill },
    { label: t('voice_assistant.prompt_shower'), q: t('voice_assistant.q_shower'), icon: Sparkles },
    { label: t('voice_assistant.prompt_pain'), q: t('voice_assistant.q_pain'), icon: AlertTriangle },
  ];

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        className="fixed bottom-24 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow"
      >
        <span className="absolute inset-0 rounded-full bg-primary-500 animate-pulseRing opacity-60" />
        <Sparkles size={24} className="text-white relative" />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={close}>
            <motion.div
              initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="glass-card w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[85vh]"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-600 to-primary-800 text-white shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} />
                  <div>
                    <p className="font-bold text-sm">{t('voice_assistant.title')}</p>
                    <p className="text-[10px] text-primary-200">{phase === 'listening' ? t('voice_assistant.listening') : phase === 'speaking' ? t('voice_assistant.speaking') : phase === 'thinking' ? t('voice_assistant.thinking') : t('voice_assistant.tap_or_type')}</p>
                  </div>
                </div>
                <button onClick={close}><X size={20} /></button>
              </div>

              {/* Chat thread */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 bg-slate-50 dark:bg-slate-900/50 min-h-[200px]">
                {msgs.map(m => (
                  <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${m.from === 'user' ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-sm'}`}>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                      {m.from === 'ai' && m.id !== 'init' && (
                        <button onClick={() => speakMsg(m)} className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition">
                          <Volume2 size={11} /> {t('voice_assistant.speak_response')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {phase === 'thinking' && (
                  <div className="flex justify-start">
                    <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1">
                      {[0,1,2].map(i => <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />)}
                    </div>
                  </div>
                )}
              </div>

              {/* Transcript */}
              {transcript && phase === 'listening' && <p className="px-4 py-1 text-xs text-slate-500 italic">"{transcript}"</p>}

              {/* Quick prompts */}
              <div className="flex gap-2 px-4 py-2 overflow-x-auto shrink-0">
                {quickPrompts.map(q => (
                  <button key={q.label} onClick={() => processQuery(q.q)} className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition">
                    <q.icon size={12} className="text-primary-600" />
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">{q.label}</span>
                  </button>
                ))}
              </div>

              {/* Visualizer + mic */}
              <div className="flex items-center justify-center gap-2 py-2 shrink-0 bg-white dark:bg-slate-900/50">
                <div className="flex items-end gap-0.5 h-6">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="w-1 rounded-full bg-primary-500"
                      animate={phase === 'listening' || phase === 'speaking' ? { height: [3, 14 + Math.random() * 10, 3] } : { height: 3 }}
                      transition={{ duration: 0.4 + Math.random() * 0.3, repeat: phase === 'listening' || phase === 'speaking' ? Infinity : 0, delay: i * 0.05 }}
                      style={{ height: 3 }}
                    />
                  ))}
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={phase === 'listening' ? stopListening : startListening}
                  className={`relative w-11 h-11 rounded-full flex items-center justify-center shadow-glow ${phase === 'listening' ? 'bg-danger-500' : phase === 'speaking' ? 'bg-emerald-500' : 'bg-primary-600'}`}
                >
                  {(phase === 'listening' || phase === 'speaking') && <span className="absolute inset-0 rounded-full bg-current animate-pulseRing opacity-50" />}
                  <Mic size={20} className="text-white relative" />
                </motion.button>
                <div className="flex items-end gap-0.5 h-6">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <motion.span
                      key={i}
                      className="w-1 rounded-full bg-primary-500"
                      animate={phase === 'listening' || phase === 'speaking' ? { height: [3, 14 + Math.random() * 10, 3] } : { height: 3 }}
                      transition={{ duration: 0.4 + Math.random() * 0.3, repeat: phase === 'listening' || phase === 'speaking' ? Infinity : 0, delay: i * 0.05 + 0.1 }}
                      style={{ height: 3 }}
                    />
                  ))}
                </div>
              </div>

              {/* Text input */}
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); } }}
                  placeholder={t('voice_assistant.type_placeholder')}
                  className="flex-1 input !py-2 !text-sm"
                />
                <button onClick={sendText} disabled={!text.trim()} className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center disabled:opacity-40 transition hover:bg-primary-700">
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
