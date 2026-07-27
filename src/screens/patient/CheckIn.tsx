import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, ArrowLeft, Check, NotebookPen } from 'lucide-react';
import { useStore } from '@/store';
import { useRouter } from '@/router';
import { Card, Button, Chip, PageHeader } from '@/components/ui';
import { WoundScanner } from '@/components/WoundScanner';
import { useTranslation } from 'react-i18next';

const SYMPTOMS = ['Headache', 'Fever', 'Nausea', 'Swelling', 'Redness', 'Fatigue'] as const;
const SYMPTOM_KEYS: Record<string, string> = {
  'Headache': 'checkin.sym_headache',
  'Fever': 'checkin.sym_fever',
  'Nausea': 'checkin.sym_nausea',
  'Swelling': 'checkin.sym_swelling',
  'Redness': 'checkin.sym_redness',
  'Fatigue': 'checkin.sym_fatigue',
};

export function CheckIn() {
  const { state, setState } = useStore();
  const { navigate, back } = useRouter();
  const { t } = useTranslation();
  const [pain, setPain] = useState(3);
  const [mood, setMood] = useState(4);
  const [energy, setEnergy] = useState(4);
  const [sleep, setSleep] = useState(4);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [saved, setSaved] = useState(false);
  const recRef = useRef<any>(null);

  const toggleSymptom = (s: string) => setSymptoms(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      // Fallback: simulate a voice check-in
      setTranscript('My pain is 6 today and I have a mild headache');
      parseVoice('my pain is 6 today and I have a mild headache');
      return;
    }
    const rec = new SR();
    rec.lang = 'en-US'; rec.interimResults = false; rec.continuous = false;
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setTranscript(t);
      parseVoice(t);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };
  const stopVoice = () => { recRef.current?.stop(); setListening(false); };

  const parseVoice = (t: string) => {
    const lower = t.toLowerCase();
    const painMatch = lower.match(/pain\s*(?:is|of)?\s*(\d{1,2})/);
    if (painMatch) setPain(Math.min(10, Math.max(1, +painMatch[1])));
    const moodMatch = lower.match(/mood\s*(?:is|of)?\s*(\d{1,2})/);
    if (moodMatch) setMood(Math.min(10, Math.max(1, +moodMatch[1])));
    SYMPTOMS.forEach(s => { if (lower.includes(s.toLowerCase())) setSymptoms(p => p.includes(s) ? p : [...p, s]); });
    if (lower.includes('tired') || lower.includes('exhausted')) setSymptoms(p => p.includes('Fatigue') ? p : [...p, 'Fatigue']);
  };

  const save = () => {
    const log = { id: 'c' + Date.now(), date: new Date().toISOString().slice(0, 10), pain, mood, energy, sleep, symptoms, note: note || transcript || undefined };
    setState(s => {
      const patients = [...s.patients];
      patients[0] = { ...patients[0], checkIns: [log, ...patients[0].checkIns], streak: patients[0].streak + 1 };
      return { ...s, patients };
    });
    setSaved(true);
    setTimeout(() => navigate('patient-home'), 1200);
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <button onClick={back} className="mb-3 text-slate-400 flex items-center gap-1 text-sm"><ArrowLeft size={16} /> {t('common.back')}</button>
      <PageHeader title={t('checkin.title')} subtitle={t('checkin.how_feeling')} />

      {/* Voice widget */}
      <Card className="mb-5 flex flex-col items-center text-center bg-gradient-to-br from-primary-50 to-white dark:from-slate-800 dark:to-slate-800/50">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">{t('checkin.voice_checkin')}</p>
        <div className="relative">
          {listening && <span className="absolute inset-0 rounded-full bg-primary-500 animate-pulseRing" />}
          <motion.button
            whileTap={{ scale: 0.9 }} onClick={listening ? stopVoice : startVoice}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-glow ${listening ? 'bg-danger-500' : 'bg-primary-600'}`}
          >
            {listening ? <Square size={28} className="text-white" fill="white" /> : <Mic size={32} className="text-white" />}
          </motion.button>
        </div>
        <p className="text-xs text-slate-500 mt-3">{listening ? t('checkin.listening') : t('checkin.tap_speak')}</p>
        {transcript && (
          <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl text-sm text-slate-600 dark:text-slate-300 italic">"{transcript}"</div>
        )}
      </Card>

      <Slider label={t('checkin.pain_level')} value={pain} setValue={setPain} color="bg-danger-500" />
      <Slider label={t('checkin.mood')} value={mood} setValue={setMood} color="bg-amber-500" />
      <Slider label={t('checkin.energy')} value={energy} setValue={setEnergy} color="bg-emerald-500" />
      <Slider label={t('checkin.sleep')} value={sleep} setValue={setSleep} color="bg-primary-500" />

      <p className="font-bold text-slate-800 dark:text-white mt-5 mb-2">{t('checkin.symptoms')}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {SYMPTOMS.map(s => (
          <button key={s} onClick={() => toggleSymptom(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${symptoms.includes(s) ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
            {symptoms.includes(s) && <Check size={12} className="inline mr-1" />}{t(SYMPTOM_KEYS[s])}
          </button>
        ))}
      </div>

      {/* Wound scanner */}
      <div className="mb-4">
        <WoundScanner compact />
      </div>

      {/* Notes */}
      <p className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2"><NotebookPen size={16} className="text-primary-600" /> {t('checkin.notes')}</p>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder={t('checkin.notes_placeholder')}
        rows={3}
        className="input mb-4 resize-none"
      />

      <Button className="w-full" onClick={save}>{t('checkin.save')}</Button>

      <AnimatePresence>
        {saved && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="glass-card p-6 text-center">
              <Check size={48} className="text-success-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 dark:text-white">{t('checkin.saved')}</p>
              <p className="text-xs text-slate-500">{t('checkin.streak_days', { n: state.patients[0].streak + 1 })}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Slider({ label, value, setValue, color }: { label: string; value: number; setValue: (n: number) => void; color: string }) {
  return (
    <Card className="mb-3">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        <Chip color="slate">{value}/10</Chip>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={e => setValue(+e.target.value)}
        className={`w-full h-2 rounded-full appearance-none cursor-pointer ${color}`} style={{ accentColor: '#2563eb' }} />
    </Card>
  );
}
