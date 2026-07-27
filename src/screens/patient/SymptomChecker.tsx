import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BrainCircuit, ChevronRight, ChevronLeft, Check, AlertTriangle, ShieldAlert, Home, Heart, Bone, Soup, Activity, Stethoscope } from 'lucide-react';
import { useRouter } from '@/router';
import { Card, Button, Chip, PageHeader } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { useTranslation } from 'react-i18next';

type Step = 'category' | 'symptoms' | 'severity' | 'result';
type Triage = 'self' | 'appointment' | 'er';

interface Result { triage: Triage; causes: string[]; advice: string[] }

export function SymptomChecker() {
  const { back, navigate } = useRouter();
  const { show } = useToast();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('category');
  const [category, setCategory] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState(5);
  const [result, setResult] = useState<Result | null>(null);

  const CATEGORIES = [
    { id: 'surgical', label: t('symptom_checker.cat_surgical'), icon: Activity, color: 'bg-primary-500' },
    { id: 'head', label: t('symptom_checker.cat_head'), icon: BrainCircuit, color: 'bg-violet-500' },
    { id: 'chest', label: t('symptom_checker.cat_chest'), icon: Heart, color: 'bg-danger-500' },
    { id: 'digestive', label: t('symptom_checker.cat_digestive'), icon: Soup, color: 'bg-amber-500' },
    { id: 'muscle', label: t('symptom_checker.cat_muscle'), icon: Bone, color: 'bg-emerald-500' },
    { id: 'general', label: t('symptom_checker.cat_general'), icon: Stethoscope, color: 'bg-slate-500' },
  ];

  const SYMPTOMS: Record<string, string[]> = {
    surgical: [t('symptom_checker.sym_redness'), t('symptom_checker.sym_swelling'), t('symptom_checker.sym_warm'), t('symptom_checker.sym_pus'), t('symptom_checker.sym_opening'), t('symptom_checker.sym_severe_pain_site')],
    head: [t('symptom_checker.sym_headache'), t('symptom_checker.sym_dizziness'), t('symptom_checker.sym_blurred'), t('symptom_checker.sym_nausea'), t('symptom_checker.sym_confusion'), t('symptom_checker.sym_stiff_neck')],
    chest: [t('symptom_checker.sym_chest_pain'), t('symptom_checker.sym_shortness'), t('symptom_checker.sym_palpitations'), t('symptom_checker.sym_tightness'), t('symptom_checker.sym_cough'), t('symptom_checker.sym_wheezing')],
    digestive: [t('symptom_checker.sym_nausea'), t('symptom_checker.sym_vomiting'), t('symptom_checker.sym_diarrhea'), t('symptom_checker.sym_constipation'), t('symptom_checker.sym_abdominal'), t('symptom_checker.sym_loss_appetite')],
    muscle: [t('symptom_checker.sym_joint_pain'), t('symptom_checker.sym_stiffness'), t('symptom_checker.sym_weakness'), t('symptom_checker.sym_limited_mobility'), t('symptom_checker.sym_muscle_spasm'), t('symptom_checker.sym_numbness')],
    general: [t('symptom_checker.sym_fever'), t('symptom_checker.sym_fatigue'), t('symptom_checker.sym_chills'), t('symptom_checker.sym_sweating'), t('symptom_checker.sym_weight_loss'), t('symptom_checker.sym_sleep_issues')],
  };

  const triageConfig: Record<Triage, { label: string; color: 'success' | 'warning' | 'danger'; icon: typeof Check }> = {
    self: { label: t('symptom_checker.triage_self'), color: 'success', icon: Home },
    appointment: { label: t('symptom_checker.triage_appointment'), color: 'warning', icon: Stethoscope },
    er: { label: t('symptom_checker.triage_er'), color: 'danger', icon: ShieldAlert },
  };

  const analyze = (cat: string, symptoms: string[], sev: number): Result => {
    const high = sev >= 8;
    const moderate = sev >= 5;
    const hasRedness = symptoms.some(s => [t('symptom_checker.sym_redness'), t('symptom_checker.sym_warm'), t('symptom_checker.sym_pus'), t('symptom_checker.sym_opening')].includes(s));
    const hasChest = cat === 'chest' && symptoms.some(s => [t('symptom_checker.sym_chest_pain'), t('symptom_checker.sym_shortness'), t('symptom_checker.sym_tightness')].includes(s));

    if (hasChest || high || (hasRedness && cat === 'surgical')) {
      return {
        triage: 'er',
        causes: cat === 'chest' ? [t('symptom_checker.cause_cardiac'), t('symptom_checker.cause_pulmonary')] : [t('symptom_checker.cause_ssi'), t('symptom_checker.cause_dehiscence')],
        advice: [t('symptom_checker.advice_er_1'), t('symptom_checker.advice_er_2'), t('symptom_checker.advice_er_3')],
      };
    }
    if (moderate || hasRedness) {
      return {
        triage: 'appointment',
        causes: [t('symptom_checker.cause_early'), t('symptom_checker.cause_inflammatory'), t('symptom_checker.cause_irritation')],
        advice: [t('symptom_checker.advice_appt_1'), t('symptom_checker.advice_appt_2'), t('symptom_checker.advice_appt_3'), t('symptom_checker.advice_appt_4')],
      };
    }
    return {
      triage: 'self',
      causes: [t('symptom_checker.cause_normal'), t('symptom_checker.cause_minor'), t('symptom_checker.cause_expected')],
      advice: [t('symptom_checker.advice_self_1'), t('symptom_checker.advice_self_2'), t('symptom_checker.advice_self_3'), t('symptom_checker.advice_self_4'), t('symptom_checker.advice_self_5')],
    };
  };

  const runAnalysis = () => {
    if (!category) return;
    const r = analyze(category, selectedSymptoms, severity);
    setResult(r);
    setStep('result');
    if (r.triage === 'er') show({ type: 'error', title: t('symptom_checker.urgent_er'), body: t('symptom_checker.serious_complication') });
  };

  const reset = () => { setStep('category'); setCategory(null); setSelectedSymptoms([]); setSeverity(5); setResult(null); };

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <button onClick={back} className="mb-3 text-slate-400 flex items-center gap-1 text-sm"><ArrowLeft size={16} /> {t('common.back')}</button>
      <PageHeader title={t('symptom_checker.title')} subtitle={t('symptom_checker.subtitle')} right={
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
            <p className="font-bold text-slate-800 dark:text-white mb-3">{t('symptom_checker.where_issue')}</p>
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
              <button onClick={() => setStep('category')} className="text-sm text-slate-400 flex items-center gap-1"><ChevronLeft size={16} /> {t('common.back')}</button>
              <p className="font-bold text-slate-800 dark:text-white">{t('symptom_checker.select_symptoms')}</p>
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
            <Button className="w-full" disabled={selectedSymptoms.length === 0} onClick={() => setStep('severity')}>{t('symptom_checker.continue')}</Button>
          </motion.div>
        )}

        {step === 'severity' && (
          <motion.div key="sev" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setStep('symptoms')} className="text-sm text-slate-400 flex items-center gap-1"><ChevronLeft size={16} /> {t('common.back')}</button>
              <p className="font-bold text-slate-800 dark:text-white">{t('symptom_checker.how_severe')}</p>
            </div>
            <Card className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('symptom_checker.severity_1_10')}</span>
                <Chip color={severity >= 8 ? 'danger' : severity >= 5 ? 'warning' : 'success'}>{severity}/10</Chip>
              </div>
              <input type="range" min={1} max={10} value={severity} onChange={e => setSeverity(+e.target.value)} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ accentColor: severity >= 8 ? '#ef4444' : severity >= 5 ? '#f59e0b' : '#10b981' }} />
              <p className="text-xs text-slate-500 mt-2">{severity >= 8 ? t('symptom_checker.severe_urgent') : severity >= 5 ? t('symptom_checker.moderate_monitor') : t('symptom_checker.mild_home')}</p>
            </Card>
            <Button className="w-full" onClick={runAnalysis}><BrainCircuit size={16} /> {t('symptom_checker.analyze')}</Button>
          </motion.div>
        )}

        {step === 'result' && result && (
          <motion.div key="res" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className={`mb-4 ${result.triage === 'self' ? 'bg-success-100 dark:bg-success-700/30' : result.triage === 'appointment' ? 'bg-warning-100 dark:bg-warning-500/20' : 'bg-danger-100 dark:bg-danger-500/20'} border-0`}>
              <div className="flex items-center gap-3 mb-3">
                {(() => { const C = triageConfig[result.triage].icon; return <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center"><C size={24} className={result.triage === 'self' ? 'text-success-600' : result.triage === 'appointment' ? 'text-warning-600' : 'text-danger-600'} /></div>; })()}
                <div>
                  <p className="text-xs text-slate-500">{t('symptom_checker.recommended_triage')}</p>
                  <p className="font-extrabold text-lg text-slate-800 dark:text-white">{triageConfig[result.triage].label}</p>
                </div>
              </div>
              <Chip color={triageConfig[result.triage].color}>
                {result.triage === 'self' ? t('symptom_checker.low_urgency') : result.triage === 'appointment' ? t('symptom_checker.medium_urgency') : t('symptom_checker.high_urgency')}
              </Chip>
            </Card>

            <Card className="mb-3">
              <p className="font-bold text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500" /> {t('symptom_checker.probable_causes')}</p>
              <ul className="space-y-1.5">
                {result.causes.map((c, i) => <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2"><span className="text-primary-500 mt-1">•</span>{c}</li>)}
              </ul>
            </Card>

            <Card className="mb-4">
              <p className="font-bold text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2"><Check size={14} className="text-success-500" /> {t('symptom_checker.personalized_advice')}</p>
              <ul className="space-y-1.5">
                {result.advice.map((a, i) => <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2"><Check size={14} className="text-success-500 mt-0.5 shrink-0" />{a}</li>)}
              </ul>
            </Card>

            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={reset}>{t('symptom_checker.check_again')}</Button>
              {result.triage === 'er' ? (
                <Button variant="danger" className="flex-1" onClick={() => navigate('sos')}>{t('symptom_checker.emergency_sos')}</Button>
              ) : result.triage === 'appointment' ? (
                <Button className="flex-1" onClick={() => navigate('book-appointment')}>{t('symptom_checker.book_appointment')}</Button>
              ) : (
                <Button className="flex-1" onClick={() => navigate('patient-home')}>{t('symptom_checker.back_home')}</Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
