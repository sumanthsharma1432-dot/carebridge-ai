import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Sparkles, Volume2, AlertTriangle, Pill, Activity, Send, VolumeX } from 'lucide-react';
import { useStore } from '@/store';
import { useToast } from '@/components/Toast';
import { useRouter } from '@/router';
import { useVoiceEngine } from '@/components/useVoiceEngine';

type Phase = 'idle' | 'listening' | 'thinking' | 'speaking';

interface Msg { id: string; from: 'user' | 'ai'; text: string }

const FAQ: { match: string[]; reply: string }[] = [
  { match: ['shower', 'bath', 'wash'], reply: "You can usually shower 48 hours after surgery once your incision is sealed. Avoid soaking the wound, and gently pat it dry — don't rub. If you have surgical glue or staples, ask your doctor before bathing." },
  { match: ['eat', 'food', 'diet', 'nutrition'], reply: "Focus on protein-rich foods like eggs, fish, and legumes to support healing. Include vitamin C from citrus and leafy greens for collagen formation. Stay hydrated, and avoid processed foods, excess sugar, and alcohol while recovering." },
  { match: ['medication', 'take my med', 'how do i take', 'pill', 'medicine'], reply: "Take your prescribed medications exactly as directed on the label. Don't skip doses, and complete the full antibiotic course even if you feel better. Take pain medication with food to prevent nausea, and never mix with alcohol." },
  { match: ['incision', 'wound', 'stitches', 'scar'], reply: "Keep your incision clean and dry. Watch for signs of infection: increasing redness, warmth, swelling, pus, or opening of the wound. Don't pick at scabs or stitches. Gentle scar massage can start once fully healed, around 2-3 weeks." },
  { match: ['exercise', 'walk', 'move', 'activity'], reply: "Start with short, gentle walks to improve circulation and prevent blood clots. Avoid heavy lifting, strenuous exercise, or driving until your doctor clears you — usually 2-6 weeks depending on your procedure." },
  { match: ['sleep', 'rest', 'tired'], reply: "Rest is essential for healing. Sleep on your back or in a position that doesn't put pressure on the surgical site. Use pillows for support. It's normal to feel more tired than usual — your body is using energy to repair tissue." },
  { match: ['fever', 'temperature', 'hot'], reply: "A low-grade fever (under 100.4°F) is common in the first 48 hours. If your fever exceeds 101°F, lasts more than 3 days, or comes with chills or severe pain, contact your doctor immediately — it may indicate infection." },
  { match: ['constipation', 'bowel', 'digestion'], reply: "Post-surgery constipation is common due to anesthesia and pain medication. Drink plenty of water, eat fiber-rich foods like fruits and whole grains, and take short walks. If it persists beyond 3 days, ask your doctor about a mild laxative." },
];

function generateReply(query: string, patient: any): string {
  const lower = query.toLowerCase();
  for (const f of FAQ) {
    if (f.match.some(m => lower.includes(m))) return f.reply;
  }
  if (lower.includes('recovery') || lower.includes('how am i') || lower.includes('doing')) {
    return `Your recovery score is ${patient.recoveryScore} percent, and it's improving. You're on day ${patient.recoveryDay} of recovery. Keep up the great work!`;
  }
  if (lower.includes('pain') || lower.includes('hurt')) {
    const sev = lower.includes('severe') || lower.includes('bad') || lower.includes('a lot') || lower.includes('high');
    return sev
      ? "I'm sorry you're in severe pain. I've flagged this as a high-risk alert and notified your care team. Would you like me to open the SOS screen?"
      : "I understand you're in pain. Make sure to log your pain level in the daily check-in, and take your prescribed medication. If it gets worse, let me know.";
  }
  if (lower.includes('next') && (lower.includes('med') || lower.includes('pill'))) {
    const next = patient.medications.find((m: any) => !m.taken);
    return next
      ? `Your next medication is ${next.name} ${next.dosage}, scheduled at ${next.time}. Instructions: ${next.instructions}.`
      : "You've taken all your medications today. Great job on your adherence!";
  }
  if (lower.includes('medication') || lower.includes('med') || lower.includes('pill')) {
    const next = patient.medications.find((m: any) => !m.taken);
    return next
      ? `Your next medication is ${next.name} ${next.dosage}, scheduled at ${next.time}. Instructions: ${next.instructions}.`
      : "You've taken all your medications today. Great job on your adherence!";
  }
  if (lower.includes('vital') || lower.includes('heart') || lower.includes('blood')) {
    return `Your latest vitals: heart rate ${patient.vitals.heartRate} bpm, blood pressure ${patient.vitals.bloodPressure}, blood oxygen ${patient.vitals.oxygen} percent. All within healthy ranges.`;
  }
  if (lower.includes('appointment') || lower.includes('doctor')) {
    return `Your next appointment is ${patient.nextAppointment.date} at ${patient.nextAppointment.time} with ${patient.nextAppointment.doctor}. It's a ${patient.nextAppointment.type}.`;
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! I can help with your recovery, medications, pain, vitals, or appointments. You can also ask about showering, diet, exercise, wound care, or sleep.";
  }
  return `I can help with your recovery score, pain levels, medications, vitals, appointments, or post-op questions about showering, diet, exercise, wound care, and sleep. Try asking about one of those.`;
}

export function VoiceAssistant({ externalOpen, onExternalOpenChange }: { externalOpen?: boolean; onExternalOpenChange?: (open: boolean) => void }) {
  const { state, setState } = useStore();
  const { show } = useToast();
  const { navigate } = useRouter();
  const { speak, stopSpeaking, recognize, stopRecognizing, recSupported } = useVoiceEngine();

  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (v: boolean) => { if (onExternalOpenChange) onExternalOpenChange(v); else setInternalOpen(v); };
  const [phase, setPhase] = useState<Phase>('idle');
  const [transcript, setTranscript] = useState('');
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 'init', from: 'ai', text: "Hi! I'm your CareBridge assistant. Ask about your recovery, medications, or post-op questions like 'When can I shower?' or 'What should I eat?'" },
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
        setState(s => ({ ...s, alerts: [{ id: 'va' + Date.now(), patientId: p.id, type: 'Voice Alert', level: 'high', time: 'now', message: 'Patient reported severe pain via voice assistant' }, ...s.alerts] }));
        show({ type: 'error', title: 'High-Risk Alert Flagged', body: 'Care team notified of severe pain report' });
        p.emergencyContacts.forEach((c: any) => show({ type: 'sms', title: `Emergency Alert SMS sent to ${c.name}`, body: c.phone }));
        setTimeout(() => navigate('sos'), 1500);
      }
      speak(reply, () => setPhase('idle'));
      setPhase('speaking');
    }, 700);
  }, [state.patients, setState, show, navigate, speak]);

  const startListening = () => {
    if (!recSupported) {
      show({ type: 'info', title: 'Voice input unavailable', body: 'Type your question instead — your browser does not support speech recognition.' });
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    const langMap: Record<string, string> = { English: 'en-US', Spanish: 'es-ES', French: 'fr-FR', German: 'de-DE', Hindi: 'hi-IN' };
    rec.lang = langMap[state.language] || 'en-US';
    rec.interimResults = false; rec.continuous = false;
    rec.onresult = (e: any) => {
      const txt = e.results[0][0].transcript;
      setTranscript(txt);
      processQuery(txt);
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
    { label: 'Recovery?', q: 'How is my recovery going?', icon: Activity },
    { label: 'Next med?', q: 'What medication do I take next?', icon: Pill },
    { label: 'Shower?', q: 'When can I shower after surgery?', icon: Sparkles },
    { label: 'I feel pain', q: 'I feel severe pain', icon: AlertTriangle },
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
                    <p className="font-bold text-sm">CareBridge Assistant</p>
                    <p className="text-[10px] text-primary-200">{phase === 'listening' ? 'Listening…' : phase === 'speaking' ? 'Speaking…' : phase === 'thinking' ? 'Thinking…' : 'Tap mic or type a question'}</p>
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
                          <Volume2 size={11} /> Speak Response
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
                  placeholder="Type your message or recovery question..."
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
