import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { X, Printer, FileText, Heart, Activity, Droplet, Pill } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store';
import { Button } from '@/components/ui';

export function DischargeSummary({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { state } = useStore();
  const p = state.patients[0];
  const checkIns = [...p.checkIns].reverse();

  const painData = checkIns.map(c => ({ day: c.date.slice(5), pain: c.pain }));
  const vitalsData = [
    { day: 'D1', hr: 78, ox: 97 }, { day: 'D2', hr: 75, ox: 98 }, { day: 'D3', hr: 74, ox: 98 },
    { day: 'D4', hr: 73, ox: 98 }, { day: 'D5', hr: 72, ox: 98 }, { day: 'D6', hr: 72, ox: 98 }, { day: 'D7', hr: 72, ox: 98 },
  ];
  const adherence = Math.round((p.medications.filter(m => m.taken).length / p.medications.length) * 100);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-primary-600" />
                <h3 className="font-bold text-slate-800 dark:text-white">{t('discharge_summary.title')}</h3>
              </div>
              <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
            </div>

            <div className="p-5 space-y-5 print-area">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <p className="text-xs text-slate-400">{t('discharge_summary.hospital')}</p>
                  <h2 className="font-extrabold text-lg text-slate-800 dark:text-white">{p.name}</h2>
                  <p className="text-xs text-slate-500">{p.surgeryType} · Day {p.recoveryDay}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{t('discharge_summary.report_date')}</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Summary metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                  <p className="text-xs text-slate-500">{t('discharge_summary.recovery')}</p>
                  <p className="text-xl font-extrabold text-success-600">{p.recoveryScore}%</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                  <p className="text-xs text-slate-500">{t('discharge_summary.adherence')}</p>
                  <p className="text-xl font-extrabold text-primary-600">{adherence}%</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                  <p className="text-xs text-slate-500">{t('discharge_summary.risk')}</p>
                  <p className="text-xl font-extrabold capitalize text-slate-800 dark:text-white">{p.risk}</p>
                </div>
              </div>

              {/* Vitals */}
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-white mb-2 flex items-center gap-2"><Heart size={14} className="text-danger-500" /> {t('discharge_summary.vitals_history')}</p>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={vitalsData}>
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                    <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} dot={false} name={t('discharge_summary.series_hr')} />
                    <Line type="monotone" dataKey="ox" stroke="#06b6d4" strokeWidth={2} dot={false} name={t('discharge_summary.series_spo2')} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Pain */}
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-white mb-2 flex items-center gap-2"><Activity size={14} className="text-warning-500" /> {t('discharge_summary.pain_trend')}</p>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={painData}>
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} hide />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                    <Bar dataKey="pain" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Medications */}
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-white mb-2 flex items-center gap-2"><Pill size={14} className="text-emerald-500" /> {t('discharge_summary.current_meds')}</p>
                <div className="space-y-1.5">
                  {p.medications.map(m => (
                    <div key={m.id} className="flex justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                      <span className="font-medium text-slate-700 dark:text-slate-200">{m.name} {m.dosage}</span>
                      <span className="text-slate-500">{m.time} · {m.taken ? t('common.taken') : t('common.pending')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI recommendations */}
              <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
                <p className="font-bold text-sm text-primary-700 dark:text-primary-300 mb-2">{t('discharge_summary.ai_recs')}</p>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <li>• {t('discharge_summary.rec_1')}</li>
                  <li>• {t('discharge_summary.rec_2')}</li>
                  <li>• {t('discharge_summary.rec_3')}</li>
                  <li>• {t('discharge_summary.rec_4')}</li>
                  <li>• {t('discharge_summary.rec_5')}</li>
                </ul>
              </div>

              <p className="text-[10px] text-slate-400 text-center">{t('discharge_summary.disclaimer')}</p>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-700 flex gap-3 no-print">
              <Button variant="ghost" className="flex-1 no-print" onClick={onClose}>{t('common.close')}</Button>
              <Button className="flex-1 no-print" onClick={() => window.print()}><Printer size={16} /> {t('discharge_summary.print_pdf')}</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
