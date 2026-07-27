import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, X, Check, Clock, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@/store';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui';

export function MedicationReminder() {
  const { t } = useTranslation();
  const { state, setState } = useStore();
  const { show } = useToast();
  const [active, setActive] = useState<{ medId: string; name: string; dosage: string } | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (active) return;
    const due = state.patients[0].medications.find(m => !m.taken && !m.missed && diffMins(now, m.time) <= 0);
    if (due) setActive({ medId: due.id, name: due.name, dosage: due.dosage });
  }, [now, state.patients, active]);

  const markTaken = () => {
    if (!active) return;
    setState(s => {
      const patients = [...s.patients];
      patients[0] = { ...patients[0], medications: patients[0].medications.map(m => m.id === active.medId ? { ...m, taken: true } : m) };
      return { ...s, patients };
    });
    show({ type: 'success', title: t('med_reminder.marked_taken', { name: active.name }), body: t('med_reminder.logged_history') });
    setActive(null);
  };

  const snooze = () => {
    if (!active) return;
    show({ type: 'info', title: t('med_reminder.snoozed'), body: t('med_reminder.remind_15') });
    setActive(null);
  };

  return (
    <AnimatePresence>
      {active && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[85] bg-black/50 flex items-center justify-center p-4" onClick={snooze}>
          <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="glass-card w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"><Bell size={18} className="text-primary-600" /></div>
                <p className="font-bold text-slate-800 dark:text-white text-sm">{t('med_reminder.title')}</p>
              </div>
              <button onClick={() => setActive(null)}><X size={18} className="text-slate-400" /></button>
            </div>

            <div className="flex flex-col items-center text-center py-3">
              <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                <Pill size={32} className="text-emerald-600" />
              </motion.div>
              <p className="text-lg font-extrabold text-slate-800 dark:text-white">{active.name} {active.dosage}</p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Clock size={12} /> {t('med_reminder.subtitle')}</p>
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="ghost" className="flex-1" onClick={snooze}><Clock size={16} /> {t('med_reminder.snooze')}</Button>
              <Button variant="success" className="flex-1" onClick={markTaken}><Check size={16} /> {t('med_reminder.mark_taken')}</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function diffMins(now: Date, time: string) {
  const [h, m] = time.split(':').map(Number);
  const target = new Date(now); target.setHours(h, m, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 60000);
}
