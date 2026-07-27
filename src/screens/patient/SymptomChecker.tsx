import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BrainCircuit, ChevronRight, ChevronLeft, Check, AlertTriangle, ShieldAlert, Home, Heart, Bone, Soup, Activity, Stethoscope } from 'lucide-react';
import { useRouter } from '@/router';
import { Card, Button, Chip, PageHeader } from '@/components/ui';
import { useToast } from '@/components/Toast';

type Step = 'category' | 'symptoms' | 'severity' | 'result';
type Triage = 'self' | 'appointment' | 'er';

const CATEGORIES = [
  { id: 'surgical', label: 'Surgical Site', icon: Activity, color: 'bg-primary-500' },
  { id: 'head', label: 'Head / Neck', icon: BrainCircuit, color: 'bg-violet-500' },
  { id: 'chest', label: 'Chest / Heart', icon: Heart, color: 'bg-danger-500' },
  { id: 'digestive', label: 'Digestive', icon: Soup, color: 'bg-amber-500' },
  { id: 'muscle', label: 'Muscle / Bone', icon: Bone, color: 'bg-emerald-500' },
  { id: 'general', label: 'General', icon: Stethoscope, color: 'bg-slate-500' },
];

const SYMPTOMS: Record<string, string[]> = {
  surgical: ['Redness', 'Swelling', 'Warm to touch', 'Pus / discharge', 'Opening of incision', 'Severe pain at site'],
  head: ['Headache', 'Dizziness', 'Blurred vision', 'Nausea', 'Confusion', 'Stiff neck'],
  chest: ['Chest pain', 'Shortness of breath', 'Palpitations', 'Tightness', 'Cough', 'Wheezing'],
  digestive: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Abdominal pain', 'Loss of appetite'],
  muscle: ['Joint pain', 'Stiffness', 'Weakness', 'Limited mobility', 'Muscle spasm', 'Numbness'],
  general: ['Fever', 'Fatigue', 'Chills', 'Sweating', 'Weight loss', 'Sleep issues'],
};

interface Result { triage: Triage; causes: string[]; advice: string[] }

function analyze(category: string, symptoms: string[], severity: number): Result {
  const high = severity >= 8;
  const moderate = severity >= 5;
  const hasRedness = symptoms.some(s => ['Redness', 'Warm to touch', 'Pus / discharge', 'Opening of incision'].includes(s));
  const hasChest = category === 'chest' && symptoms.some(s => ['Chest pain', 'Shortness of breath', 'Tightness'].includes(s));

  if (hasChest || high || (hasRedness && category === 'surgical')) {
    return {
      triage: 'er',
      causes: category === 'chest' ? ['Possible cardiac event', 'Pulmonary complication'] : ['Possible surgical site infection', 'Wound dehiscence'],
      advice: ['Go to the nearest emergency room immediately', 'Do not drive yourself — call an ambulance or have someone take you', 'Bring your medication list and discharge summary'],
    };
  }
  if (moderate || hasRedness) {
    return {
      triage: 'appointment',
      causes: ['Early signs of complication', 'Inflammatory response', 'Post-operative irritation'],
      advice: ['Schedule an appointment with your doctor within 24 hours', 'Monitor symptoms closely', 'Keep the area clean and dry', 'Take prescribed pain medication as directed'],
    };
  }
  return {
    triage: 'self',
    causes: ['Normal post-operative healing', 'Minor inflammation', 'Expected recovery discomfort'],
    advice: ['Rest and stay hydrated', 'Continue prescribed medications', 'Apply ice if swelling occurs', 'Log symptoms in your daily check-in', 'Re-evaluate in 24 hours'],
  };
}

const triageConfig: Record<Triage, { label: string; color: 'success' | 'warning' | 'danger'; icon: typeof Check }> = {
  self: { label: 'Self-Care at Home', color: 'success', icon: Home },
  appointment: { label: 'Schedule Appointment', color: 'warning', icon: Stethoscope },
  er: { label: 'Go to ER Now', color: 'danger', icon: ShieldAlert },
};

export function SymptomChecker() {
  const { back, navigate } = useRouter();
  const { show } = useToast();
  const [step, setStep] = useState<Step>('category');
  const [category, setCategory] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState(5);
  const [result, setResult] = useState<Result | null>(null);

  const runAnalysis = () => {
    if (!category) return;
    const r = analyze(category, selectedSymptoms, severity);
    setResult(r);
    setStep('result');
    if (r.triage === 'er') show({ type: 'error', title: 'Urgent: ER Visit Recommended', body: 'Your symptoms may indicate a serious complication' });
  };

  const reset = () => { setStep('category'); setCategory(null); setSelectedSymptoms([]); setSeverity(5); setResult(null); };

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <button onClick={back} className="mb-3 text-slate-400 flex items-center gap-1 text-sm"><ArrowLeft size={16} /> Back</button>
      <PageHeader title="AI Symptom Checker" subtitle="Get instant triage guidance" right={
        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"><BrainCircuit size={20} className="text-violet-500" /></div>
      } />

      <div className="flex items-center gap-2 mb-5">
        {(['category', 'symptoms', 'severity', 'result'] as Step[]).map((s, i) => {
          const order = ['category', 'symptoms', 'severity', 'result'].indexOf(step);
          const done = i <= order;
          return <div key={s} className={`h-1.5 flex-1 rounded-full transition ${done ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`} />;
        })}
      </div>

      <AnimatePresence mode="wait">
        {step === 'category' && (
          <motion.div key="cat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <p className="font-bold text-slate-800 dark:text-white mb-3">Where is the issue?</p>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(c => (
                <motion.button key={c.id} whileTap={{ scale: 0.96 }} onClick={() => { setCategory(c.id); setStep('symptoms'); }}
                  className="glass-card p-4 flex flex-col items-center gap-2 text-center hover:ring-2 hover:ring-primary-400 transition">
                  <div className={`w-12 h-12 rounded-2xl ${c.color} flex items-center justify-center`}><c.icon size={22} className="text-white" /></div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{c.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'symptoms' && category && (
          <motion.div key="sym" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setStep('category')} className="text-sm text-slate-400 flex items-center gap-1"><ChevronLeft size={16} /> Back</button>
              <p className="font-bold text-slate-800 dark:text-white">Select symptoms</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {SYMPTOMS[category].map(s => {
                const active = selectedSymptoms.includes(s);
                return (
                  <button key={s} onClick={() => setSelectedSymptoms(p => active ? p.filter(x => x !== s) : [...p, s])}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${active ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    {active && <Check size={12} className="inline mr-1" />}{s}
                  </button>
                );
              })}
            </div>
            <Button className="w-full" disabled={selectedSymptoms.length === 0} onClick={() => setStep('severity')}>Continue</Button>
          </motion.div>
        )}

        {step === 'severity' && (
          <motion.div key="sev" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setStep('symptoms')} className="text-sm text-slate-400 flex items-center gap-1"><ChevronLeft size={16} /> Back</button>
              <p className="font-bold text-slate-800 dark:text-white">How severe?</p>
            </div>
            <Card className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Severity (1-10)</span>
                <Chip color={severity >= 8 ? 'danger' : severity >= 5 ? 'warning' : 'success'}>{severity}/10</Chip>
              </div>
              <input type="range" min={1} max={10} value={severity} onChange={e => setSeverity(+e.target.value)} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ accentColor: severity >= 8 ? '#ef4444' : severity >= 5 ? '#f59e0b' : '#10b981' }} />
              <p className="text-xs text-slate-500 mt-2">{severity >= 8 ? 'Severe — requires urgent attention' : severity >= 5 ? 'Moderate — monitor closely' : 'Mild — likely manageable at home'}</p>
            </Card>
            <Button className="w-full" onClick={runAnalysis}><BrainCircuit size={16} /> Analyze with AI</Button>
          </motion.div>
        )}

        {step === 'result' && result && (
          <motion.div key="res" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className={`mb-4 ${result.triage === 'self' ? 'bg-success-100 dark:bg-success-700/30' : result.triage === 'appointment' ? 'bg-warning-100 dark:bg-warning-500/20' : 'bg-danger-100 dark:bg-danger-500/20'} border-0`}>
              <div className="flex items-center gap-3 mb-3">
                {(() => { const C = triageConfig[result.triage].icon; return <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center"><C size={24} className={result.triage === 'self' ? 'text-success-600' : result.triage === 'appointment' ? 'text-warning-600' : 'text-danger-600'} /></div>; })()}
                <div>
                  <p className="text-xs text-slate-500">Recommended Triage</p>
                  <p className="font-extrabold text-lg text-slate-800 dark:text-white">{triageConfig[result.triage].label}</p>
                </div>
              </div>
              <Chip color={triageConfig[result.triage].color}>
                {result.triage === 'self' ? 'Low urgency' : result.triage === 'appointment' ? 'Medium urgency' : 'High urgency'}
              </Chip>
            </Card>

            <Card className="mb-3">
              <p className="font-bold text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500" /> Probable Causes</p>
              <ul className="space-y-1.5">
                {result.causes.map((c, i) => <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2"><span className="text-primary-500 mt-1">•</span>{c}</li>)}
              </ul>
            </Card>

            <Card className="mb-4">
              <p className="font-bold text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2"><Check size={14} className="text-success-500" /> Personalized Advice</p>
              <ul className="space-y-1.5">
                {result.advice.map((a, i) => <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2"><Check size={14} className="text-success-500 mt-0.5 shrink-0" />{a}</li>)}
              </ul>
            </Card>

            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={reset}>Check Again</Button>
              {result.triage === 'er' ? (
                <Button variant="danger" className="flex-1" onClick={() => navigate('sos')}>Emergency SOS</Button>
              ) : result.triage === 'appointment' ? (
                <Button className="flex-1" onClick={() => navigate('book-appointment')}>Book Appointment</Button>
              ) : (
                <Button className="flex-1" onClick={() => navigate('patient-home')}>Back Home</Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
