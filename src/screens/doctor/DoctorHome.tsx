import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, AlertTriangle, TrendingUp, ArrowLeft, Download, Plus, X, FileText, ChevronRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { useStore } from '@/store';
import { useRouter } from '@/router';
import { Card, Button, Chip, PageHeader, RiskBadge } from '@/components/ui';
import { LanguageSelector } from '@/components/LanguageSelector';
import { DischargeSummary } from '@/components/DischargeSummary';
import { useTranslation } from 'react-i18next';

export function DoctorHome() {
  const { state } = useStore();
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'high' | 'moderate' | 'low'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const filtered = state.doctorPatients.filter(p =>
    (filter === 'all' || p.risk === filter) &&
    (p.name.toLowerCase().includes(query.toLowerCase()) || p.surgeryType.toLowerCase().includes(query.toLowerCase()))
  );

  const flagged = state.doctorPatients.filter(p => p.flagged).length;
  const avgScore = Math.round(state.doctorPatients.reduce((a, p) => a + p.recoveryScore, 0) / state.doctorPatients.length);

  const selected = state.doctorPatients.find(p => p.id === selectedId);

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <PageHeader title={t('doctor_home.dashboard')} subtitle={t('doctor_home.dr_chen')} right={
        <div className="flex items-center gap-2">
          <LanguageSelector compact />
          <button onClick={() => navigate('profile')}><img src="https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&w=200" alt="" className="w-10 h-10 rounded-full ring-2 ring-primary-500" /></button>
        </div>
      } />

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Card className="text-center"><div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-1"><Users size={18} className="text-primary-600" /></div><p className="text-2xl font-extrabold text-slate-800 dark:text-white">{state.doctorPatients.length}</p><p className="text-xs text-slate-500">{t('common.active')}</p></Card>
        <Card className="text-center"><div className="w-9 h-9 rounded-xl bg-danger-100 dark:bg-danger-500/20 flex items-center justify-center mx-auto mb-1"><AlertTriangle size={18} className="text-danger-500" /></div><p className="text-2xl font-extrabold text-danger-500">{flagged}</p><p className="text-xs text-slate-500">{t('doctor_home.red_alerts')}</p></Card>
        <Card className="text-center"><div className="w-9 h-9 rounded-xl bg-success-100 dark:bg-success-700/30 flex items-center justify-center mx-auto mb-1"><TrendingUp size={18} className="text-success-600" /></div><p className="text-2xl font-extrabold text-success-600">{avgScore}%</p><p className="text-xs text-slate-500">{t('doctor_home.avg_score')}</p></Card>
      </div>

      {/* Active alerts */}
      <p className="font-bold text-slate-800 dark:text-white mb-3">{t('admin.active_alerts')}</p>
      <div className="space-y-2 mb-5">
        {state.alerts.map(a => {
          const pat = state.doctorPatients.find(p => p.id === a.patientId);
          return (
            <Card key={a.id} className="flex items-start gap-3" onClick={() => setSelectedId(a.patientId)}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.level === 'high' ? 'bg-danger-100 dark:bg-danger-500/20' : 'bg-warning-100 dark:bg-warning-500/20'}`}>
                <AlertTriangle size={16} className={a.level === 'high' ? 'text-danger-500' : 'text-warning-500'} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{pat?.name}</p>
                <p className="text-xs text-slate-500">{a.message}</p>
              </div>
              <span className="text-[10px] text-slate-400">{a.time}</span>
            </Card>
          );
        })}
      </div>

      {/* Search & filter */}
      <div className="relative mb-3">
        <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
        <input className="input pl-11" placeholder={t('doctor_home.search_patients')} value={query} onChange={e => setQuery(e.target.value)} />
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(['all', 'high', 'moderate', 'low'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize transition ${filter === f ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{f === 'all' ? t('doctor_home.filter_all') : f === 'high' ? t('doctor_home.filter_high') : f === 'moderate' ? t('doctor_home.filter_moderate') : t('doctor_home.filter_low')}</button>
        ))}
      </div>

      {/* Patient cards */}
      <div className="space-y-3">
        {filtered.map(p => (
          <Card key={p.id} onClick={() => setSelectedId(p.id)}>
            <div className="flex items-center gap-3">
              <img src={p.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{p.name}</p>
                  <RiskBadge level={p.risk} />
                </div>
                <p className="text-xs text-slate-500">{p.surgeryType} · {t('doctor_home.day_n', { n: p.recoveryDay })}</p>
                <div className="flex gap-3 mt-1.5 text-[10px] text-slate-400">
                  <span>❤️ {p.recentVitals.heartRate}</span><span>🩸 {p.recentVitals.bp}</span><span>🌡️ {p.recentVitals.temp}°F</span><span>🫁 {p.recentVitals.oxygen}%</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </div>
          </Card>
        ))}
      </div>

      {/* Discharge summary for doctor */}
      <Button variant="outline" className="w-full mt-4" onClick={() => setShowSummary(true)}><FileText size={16} /> {t('doctor_home.download_summary')}</Button>
      <DischargeSummary open={showSummary} onClose={() => setShowSummary(false)} />

      {/* Patient drawer */}
      <AnimatePresence>
        {selected && <PatientDrawer patientId={selected.id} onClose={() => setSelectedId(null)} />}
      </AnimatePresence>
    </div>
  );
}

function PatientDrawer({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const { state, setState } = useStore();
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const p = state.doctorPatients.find(x => x.id === patientId)!;
  const [showMed, setShowMed] = useState(false);
  const [med, setMed] = useState({ name: '', dosage: '', time: '08:00' });

  const vitalsData = [
    { day: 'D1', hr: 92 }, { day: 'D2', hr: 88 }, { day: 'D3', hr: 84 }, { day: 'D4', hr: 80 }, { day: 'D5', hr: p.recentVitals.heartRate },
  ];
  const scoreData = [
    { day: 'D1', score: p.recoveryScore - 20 }, { day: 'D2', score: p.recoveryScore - 12 }, { day: 'D3', score: p.recoveryScore - 5 }, { day: 'D4', score: p.recoveryScore - 2 }, { day: 'D5', score: p.recoveryScore },
  ];

  const assignMed = () => {
    if (!med.name) return;
    setState(s => ({ ...s, alerts: [{ id: 'a' + Date.now(), patientId, type: 'Medication', level: 'low', time: 'now', message: t('doctor_home.med_assigned', { name: med.name, dosage: med.dosage }) }, ...s.alerts] }));
    setMed({ name: '', dosage: '', time: '08:00' });
    setShowMed(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring' }} className="glass-card w-full max-w-md max-h-[90vh] overflow-y-auto rounded-b-none sm:rounded-2xl p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={p.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="font-bold text-slate-800 dark:text-white">{p.name}</p>
              <p className="text-xs text-slate-500">{p.surgeryType} · {t('doctor_home.day_n', { n: p.recoveryDay })}</p>
            </div>
          </div>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>

        <div className="flex items-center gap-2 mb-4"><RiskBadge level={p.risk} /><Chip color="slate">{t('doctor_home.last_checkin', { time: p.lastCheckIn })}</Chip></div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[{ l: t('doctor_home.hr'), v: p.recentVitals.heartRate }, { l: t('doctor_home.bp'), v: p.recentVitals.bp }, { l: t('doctor_home.temp'), v: p.recentVitals.temp }, { l: t('doctor_home.spo2'), v: p.recentVitals.oxygen + '%' }].map(x => (
            <div key={x.l} className="text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
              <p className="text-[10px] text-slate-500">{x.l}</p><p className="text-sm font-bold text-slate-800 dark:text-white">{x.v}</p>
            </div>
          ))}
        </div>

        <Card className="mb-3"><p className="text-sm font-bold mb-2">{t('doctor_home.heart_rate_trend')}</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={vitalsData}><XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip /><Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} /></LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="mb-3"><p className="text-sm font-bold mb-2">{t('doctor_home.recovery_score')}</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={scoreData}><XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip /><Bar dataKey="score" fill="#10b981" radius={[4,4,0,0]} /></BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="flex gap-2 mb-3">
          <Button variant="outline" className="flex-1" onClick={() => setShowMed(true)}><Plus size={16} /> {t('doctor_home.assign_med')}</Button>
          <Button variant="outline" className="flex-1" onClick={() => { onClose(); navigate('doctor-telehealth'); }}><FileText size={16} /> {t('doctor_home.message')}</Button>
        </div>
        <Button variant="ghost" className="w-full" onClick={() => alert(t('doctor_home.pdf_downloaded'))}><Download size={16} /> {t('doctor_home.download_pdf')}</Button>

        <AnimatePresence>
          {showMed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
              <p className="font-bold text-sm mb-2">{t('doctor_home.assign_new_med')}</p>
              <div className="space-y-2">
                <input className="input" placeholder={t('doctor_home.med_name_placeholder')} value={med.name} onChange={e => setMed({ ...med, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <input className="input" placeholder={t('doctor_home.dosage_placeholder')} value={med.dosage} onChange={e => setMed({ ...med, dosage: e.target.value })} />
                  <input type="time" className="input" value={med.time} onChange={e => setMed({ ...med, time: e.target.value })} />
                </div>
                <div className="flex gap-2"><Button variant="ghost" className="flex-1" onClick={() => setShowMed(false)}>{t('common.cancel')}</Button><Button className="flex-1" onClick={assignMed}>{t('doctor_home.assign')}</Button></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
