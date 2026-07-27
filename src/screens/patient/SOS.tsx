import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, Phone, Stethoscope, Users, MapPin, ArrowLeft, Check, Pill, AlertTriangle, PersonStanding, HelpCircle, Activity } from 'lucide-react';
import { useStore } from '@/store';
import { useRouter } from '@/router';
import { Button, Chip } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { useTranslation } from 'react-i18next';

type Severity = 'Low' | 'Moderate' | 'High' | 'Critical';

const SEVERITIES: Severity[] = ['Low', 'Moderate', 'High', 'Critical'];

export function SOS() {
  const { back } = useRouter();
  const { state } = useStore();
  const { show } = useToast();
  const { t } = useTranslation();
  const categories = [
    { id: 'medical', icon: Activity, title: t('sos.medical'), desc: t('sos.medical_desc') },
    { id: 'fall', icon: PersonStanding, title: t('sos.fall'), desc: t('sos.fall_desc') },
    { id: 'medication', icon: Pill, title: t('sos.medication_issue'), desc: t('sos.medication_desc') },
    { id: 'other', icon: HelpCircle, title: t('sos.other'), desc: t('sos.other_desc') },
  ];
  const [category, setCategory] = useState<string>('medical');
  const [location, setLocation] = useState('Home');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('High');
  const [sent, setSent] = useState(false);

  const sendAlert = () => {
    setSent(true);
    state.patients[0].emergencyContacts.forEach(c => {
      show({ type: 'sms', title: `${t('sos.sms_sent')} ${c.name}`, body: `${c.phone} · ${category} · ${severity}` });
    });
    show({ type: 'error', title: t('sos.alert_sent_toast'), body: t('sos.ambulance_notified') });
  };

  const sevColor = (s: Severity) => {
    if (s !== severity) return 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900';
    const m: Record<Severity, string> = { Low: 'bg-success-500 text-white border-success-500', Moderate: 'bg-warning-500 text-white border-warning-500', High: 'bg-danger-500 text-white border-danger-500', Critical: 'bg-black text-white border-black' };
    return m[s];
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pb-24">
      {/* Red header */}
      <div className="bg-danger-500 text-white pt-6 pb-8 px-5">
        <button onClick={back} className="flex items-center gap-1 text-white/80 text-sm mb-4"><ArrowLeft size={16} /> {t('common.back')}</button>
        <div className="flex items-center gap-3">
          <Siren size={28} className="text-white animate-float" />
          <div>
            <h1 className="text-2xl font-extrabold">{t('sos.title')}</h1>
            <p className="text-danger-100 text-sm mt-0.5">{t('sos.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* White card body */}
      <div className="-mt-4 rounded-t-3xl bg-white dark:bg-slate-900 px-5 pt-6 space-y-6">

        {/* What's happening */}
        <div>
          <h2 className="font-bold text-slate-800 dark:text-white text-base mb-3">{t('sos.whats_happening')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(c => (
              <motion.button
                key={c.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setCategory(c.id)}
                className={`p-4 rounded-2xl border-2 text-left transition ${category === c.id ? 'border-danger-400 bg-danger-50 dark:bg-danger-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
              >
                <c.icon size={22} className={category === c.id ? 'text-danger-500 mb-2' : 'text-slate-400 mb-2'} />
                <p className={`font-bold text-sm ${category === c.id ? 'text-slate-800 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>{c.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{c.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">{t('sos.your_location')}</label>
          <div className="relative">
            <MapPin size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input className="input pl-11" value={location} onChange={e => setLocation(e.target.value)} placeholder={t('sos.location_placeholder')} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">{t('sos.describe_optional')}</label>
          <textarea rows={3} className="input resize-none" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('sos.describe_placeholder')} />
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">{t('sos.severity')}</label>
          <div className="grid grid-cols-4 gap-2">
            {SEVERITIES.map(s => (
              <button key={s} onClick={() => setSeverity(s)} className={`py-2.5 rounded-xl text-sm font-semibold border transition ${sevColor(s)}`}>{s === 'Low' ? t('common.low') : s === 'Moderate' ? t('common.moderate') : s === 'High' ? t('common.high') : t('common.critical')}</button>
            ))}
          </div>
        </div>

        {/* Emergency contacts quick dial */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">{t('sos.quick_dial')}</p>
          <div className="flex gap-3">
            <a href="tel:911" className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-danger-500 text-white font-semibold text-sm"><Phone size={16} /> {t('sos.call_911')}</a>
            <a href={`tel:${state.patients[0].emergencyContacts[0]?.phone}`} className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-primary-600 text-white font-semibold text-sm"><Users size={16} /> {t('sos.family')}</a>
            <button onClick={() => show({ type: 'sms', title: t('sos.notified_dr'), body: t('sos.dr_chen_alerted') })} className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm"><Stethoscope size={16} /> {t('sos.doctor')}</button>
          </div>
        </div>

        {/* Send alert */}
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div key="sent" initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-3 py-4">
              <div className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-700/30 flex items-center justify-center">
                <Check size={36} className="text-success-600" />
              </div>
              <p className="font-bold text-slate-800 dark:text-white">{t('sos.alert_sent')}</p>
              <p className="text-xs text-slate-500">{t('sos.care_team_notified')}</p>
              <Button variant="ghost" className="w-full" onClick={() => setSent(false)}>{t('sos.cancel_alert')}</Button>
            </motion.div>
          ) : (
            <motion.div key="btn">
              <Button variant="danger" className="w-full py-4 text-base" onClick={sendAlert}>
                <Siren size={20} /> {t('sos.send_alert')}
              </Button>
              <p className="text-xs text-slate-400 text-center mt-2">{t('sos.will_notify')}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-4" />
      </div>
    </div>
  );
}
