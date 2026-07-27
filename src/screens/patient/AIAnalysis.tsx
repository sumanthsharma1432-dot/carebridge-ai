import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { BrainCircuit, TrendingUp, AlertTriangle, Pill, Stethoscope, ArrowLeft, Activity, ShieldCheck, FileText, ChevronRight } from 'lucide-react';
import { useStore } from '@/store';
import { useRouter } from '@/router';
import { Card, Button, Chip, PageHeader, RiskBadge } from '@/components/ui';
import { WoundScanner } from '@/components/WoundScanner';
import { DischargeSummary } from '@/components/DischargeSummary';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const recoveryForecast = [
  { day: 'D7', score: 40 }, { day: 'D6', score: 48 }, { day: 'D5', score: 55 },
  { day: 'D4', score: 63 }, { day: 'D3', score: 70 }, { day: 'D2', score: 76 }, { day: 'D1', score: 82 },
  { day: 'Now', score: 82 }, { day: '+3d', score: 88 }, { day: '+1w', score: 92 },
];

export function AIAnalysis() {
  const { state } = useStore();
  const { back, navigate } = useRouter();
  const { t } = useTranslation();
  const p = state.patients[0];
  const [showSummary, setShowSummary] = useState(false);

  const radarData = [
    { metric: t('ai_analysis.metric_pain'), value: 3, fullMark: 10 },
    { metric: t('ai_analysis.metric_mood'), value: 8, fullMark: 10 },
    { metric: t('ai_analysis.metric_energy'), value: 7, fullMark: 10 },
    { metric: t('ai_analysis.metric_sleep'), value: 8, fullMark: 10 },
    { metric: t('ai_analysis.metric_vitals'), value: 9, fullMark: 10 },
    { metric: t('ai_analysis.metric_adherence'), value: 9, fullMark: 10 },
  ];

  const warnings = [
    { level: 'low', text: t('ai_analysis.warning_1'), icon: TrendingUp },
    { level: 'moderate', text: t('ai_analysis.warning_2'), icon: AlertTriangle },
    { level: 'low', text: t('ai_analysis.warning_3'), icon: Pill },
  ] as const;

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <button onClick={back} className="mb-3 text-slate-400 flex items-center gap-1 text-sm"><ArrowLeft size={16} /> {t('common.back')}</button>
      <PageHeader title={t('ai_analysis.title')} subtitle={t('ai_analysis.subtitle')} right={
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <BrainCircuit size={20} className="text-amber-500" />
        </div>
      } />

      {/* Score cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="bg-gradient-to-br from-success-50 to-white dark:from-success-700/20 dark:to-slate-800">
          <Activity size={18} className="text-success-500 mb-1" />
          <p className="text-xs text-slate-500">{t('ai_analysis.recovery_forecast')}</p>
          <p className="text-2xl font-extrabold text-success-600">88%</p>
          <p className="text-[10px] text-success-600">{t('ai_analysis.forecast_6pct')}</p>
        </Card>
        <Card className="bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-slate-800">
          <ShieldCheck size={18} className="text-primary-500 mb-1" />
          <p className="text-xs text-slate-500">{t('ai_analysis.infection_risk')}</p>
          <p className="text-2xl font-extrabold text-primary-600">{t('common.low')}</p>
          <p className="text-[10px] text-primary-600">{t('ai_analysis.stable_vitals')}</p>
        </Card>
        <Card>
          <Pill size={18} className="text-emerald-500 mb-1" />
          <p className="text-xs text-slate-500">{t('ai_analysis.med_adherence')}</p>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-white">94%</p>
          <p className="text-[10px] text-slate-400">{t('ai_analysis.this_week')}</p>
        </Card>
        <Card>
          <Stethoscope size={18} className="text-violet-500 mb-1" />
          <p className="text-xs text-slate-500">{t('ai_analysis.next_visit')}</p>
          <p className="text-lg font-extrabold text-slate-800 dark:text-white">{t('ai_analysis.tomorrow')}</p>
          <p className="text-[10px] text-slate-400">10:30 AM</p>
        </Card>
      </div>

      {/* Risk */}
      <Card className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{t('ai_analysis.overall_risk')}</p>
          <p className="font-bold text-slate-800 dark:text-white">{t('ai_analysis.complication_prob')}</p>
        </div>
        <RiskBadge level={p.risk} />
      </Card>

      {/* Recovery forecast chart */}
      <Card className="mb-4">
        <p className="font-bold text-slate-800 dark:text-white text-sm mb-3">{t('ai_analysis.score_forecast')}</p>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={recoveryForecast}>
            <defs>
              <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} hide />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fill="url(#recGrad)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>{t('ai_analysis.past_7_days')}</span><span>{t('ai_analysis.forecast_arrow')}</span>
        </div>
      </Card>

      {/* Radar */}
      <Card className="mb-4">
        <p className="font-bold text-slate-800 dark:text-white text-sm mb-3">{t('ai_analysis.wellness_profile')}</p>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#64748b' }} />
            <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
            <Radar dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Warnings */}
      <p className="font-bold text-slate-800 dark:text-white mb-3">{t('ai_analysis.ai_predictions')}</p>
      <div className="space-y-2 mb-4">
        {warnings.map((w, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${w.level === 'low' ? 'bg-success-100 dark:bg-success-900/30' : 'bg-warning-100 dark:bg-warning-500/20'}`}>
                <w.icon size={18} className={w.level === 'low' ? 'text-success-600' : 'text-warning-600'} />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{w.text}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Doctor recs */}
      <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0">
        <p className="font-bold mb-2 flex items-center gap-2"><Stethoscope size={18} /> {t('ai_analysis.doctor_recs')}</p>
        <ul className="text-sm space-y-1.5 text-primary-50">
          <li>• {t('ai_analysis.rec_1')}</li>
          <li>• {t('ai_analysis.rec_2')}</li>
          <li>• {t('ai_analysis.rec_3')}</li>
          <li>• {t('ai_analysis.rec_4')}</li>
        </ul>
        <Button variant="ghost" className="mt-3 bg-white/15 text-white hover:bg-white/25" onClick={() => navigate('doctor-chat')}>{t('ai_analysis.message_dr')}</Button>
      </Card>

      {/* Wound scanner */}
      <div className="mt-4">
        <WoundScanner />
      </div>

      {/* Symptom Checker card */}
      <Card onClick={() => navigate('symptom-checker')} className="mt-4 flex items-center justify-between bg-gradient-to-r from-violet-50 to-primary-50 dark:from-violet-900/20 dark:to-primary-900/20 border-violet-200 dark:border-violet-800/40">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center"><BrainCircuit size={22} className="text-violet-600" /></div>
          <div>
            <p className="font-bold text-slate-800 dark:text-white text-sm">{t('ai_analysis.symptom_checker')}</p>
            <p className="text-xs text-slate-500">{t('ai_analysis.triage_guidance')}</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-slate-400" />
      </Card>

      {/* Discharge summary */}
      <Button variant="outline" className="w-full mt-4" onClick={() => setShowSummary(true)}><FileText size={16} /> {t('ai_analysis.download_summary')}</Button>
      <DischargeSummary open={showSummary} onClose={() => setShowSummary(false)} />
    </div>
  );
}
