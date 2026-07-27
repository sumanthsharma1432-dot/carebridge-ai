import { motion } from 'framer-motion';
import { Heart, Activity, Droplet, Bell, Flame, Calendar, Video, ChevronRight, Mic, Pill, BrainCircuit, Watch, Stethoscope, Siren, TrendingUp, FileText, Watch as WatchIcon, CalendarPlus } from 'lucide-react';
import { useStore } from '@/store';
import { useRouter } from '@/router';
import { Card, Gauge, RiskBadge, Button } from '@/components/ui';
import { LanguageSelector } from '@/components/LanguageSelector';
import { DischargeSummary } from '@/components/DischargeSummary';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export function PatientHome() {
  const { state } = useStore();
  const { navigate } = useRouter();
  const { t } = useTranslation();
  const patient = state.patients[0];
  const [now, setNow] = useState(new Date());
  const [showSummary, setShowSummary] = useState(false);
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(timer); }, []);

  const hour = now.getHours();
  const greeting = hour < 12 ? t('greeting_morning') : hour < 18 ? t('greeting_afternoon') : t('greeting_evening');
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const nextMed = patient.medications.find(m => !m.taken);
  const minsToMed = nextMed ? diffMins(now, nextMed.time) : null;

  const quickActions = [
    { label: t('home.action_checkin'), icon: Mic, color: 'bg-blue-500', route: 'checkin' as const },
    { label: t('home.action_medication'), icon: Pill, color: 'bg-emerald-500', route: 'medication' as const },
    { label: t('home.action_ai'), icon: BrainCircuit, color: 'bg-amber-500', route: 'ai-analysis' as const },
    { label: t('home.action_wearables'), icon: Watch, color: 'bg-cyan-500', route: 'wearables' as const },
    { label: t('home.action_doctor'), icon: Stethoscope, color: 'bg-violet-500', route: 'doctor-chat' as const },
    { label: t('home.action_sos'), icon: Siren, color: 'bg-danger-500', route: 'sos' as const },
  ];

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{dateStr}</p>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">{greeting}, Sarah</h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector compact />
          <button onClick={() => navigate('sos')} className="relative">
            <Bell size={22} className="text-slate-600 dark:text-slate-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">3</span>
          </button>
          <button onClick={() => navigate('profile')}>
            <img src={patient.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-500" />
          </button>
        </div>
      </div>

      {/* Recovery Score */}
      <Card className="mb-4 bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm">{t('home.recovery_score')}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-success-500/30 text-success-100 chip"><TrendingUp size={12} /> {t('home.improving')}</span>
            </div>
            <p className="text-xs text-primary-200 mt-3">{t('home.day_of_recovery', { n: patient.recoveryDay })}</p>
          </div>
          <div className="text-white"><Gauge value={patient.recoveryScore} size={130} /></div>
        </div>
      </Card>

      {/* AI Risk */}
      <Card className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('home.ai_risk')}</p>
          <p className="font-bold text-slate-800 dark:text-white mt-0.5">{t('home.complication_risk')}</p>
        </div>
        <RiskBadge level={patient.risk} />
      </Card>

      {/* Vitals grid - 3 vitals shown when wearable connected */}
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2"><WatchIcon size={16} className="text-primary-600" /> {t('home.live_vitals')}</p>
        <span className="chip bg-success-100 text-success-700 dark:bg-success-700/30 dark:text-success-400"><span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" /> {t('home.device_connected', { device: patient.vitals.syncedVia })}</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <VitalCard icon={Heart} color="text-danger-500" label={t('home.heart_rate')} value={String(patient.vitals.heartRate)} unit={t('home.bpm')} />
        <VitalCard icon={Activity} color="text-primary-500" label={t('home.blood_pressure')} value={patient.vitals.bloodPressure} unit={t('home.mmhg')} />
        <VitalCard icon={Droplet} color="text-cyan-500" label={t('home.blood_oxygen')} value={String(patient.vitals.oxygen)} unit="%" />
      </div>
      <p className="text-xs text-slate-400 text-center mb-4 -mt-1">{t('home.synced_time', { time: patient.vitals.lastSync })}</p>

      {/* Medication */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-slate-800 dark:text-white">{t('home.todays_meds')}</p>
          <button onClick={() => navigate('medication')} className="text-xs text-primary-600 font-semibold">{t('home.view_all')}</button>
        </div>
        {nextMed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Pill size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white text-sm">{nextMed.name} {nextMed.dosage}</p>
                <p className="text-xs text-slate-500">⏰ {minsToMed !== null && minsToMed > 0 ? t('home.in_time', { time: formatMins(minsToMed) }) : t('home.due_now')}</p>
              </div>
            </div>
            <Button variant="success" onClick={() => navigate('medication')}>{t('home.take')}</Button>
          </div>
        ) : (
          <p className="text-sm text-success-600 font-medium">{t('home.all_meds_taken')}</p>
        )}
      </Card>

      {/* Next appointment */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-slate-800 dark:text-white text-sm">{t('home.next_appointment')}</p>
          <button onClick={() => navigate('book-appointment')} className="text-xs text-primary-600 font-semibold flex items-center gap-1"><CalendarPlus size={12} /> {t('home.book')}</button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
              <Video size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white text-sm">{patient.nextAppointment.doctor}</p>
              <p className="text-xs text-slate-500">{patient.nextAppointment.date} · {patient.nextAppointment.time}</p>
            </div>
          </div>
          <Button onClick={() => navigate('video-call')}>{t('home.join_call')}</Button>
        </div>
      </Card>

      {/* Streak */}
      <Card className="mb-4 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800/40">
        <div className="flex items-center gap-3">
          <Flame size={28} className="text-orange-500" />
          <div>
            <p className="font-extrabold text-slate-800 dark:text-white">{t('home.days', { n: patient.streak })}</p>
            <p className="text-xs text-slate-500">{t('home.checkin_streak')}</p>
          </div>
        </div>
        <Calendar size={20} className="text-amber-400" />
      </Card>

      {/* Quick actions */}
      <p className="font-bold text-slate-800 dark:text-white mb-3">{t('home.quick_actions')}</p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {quickActions.map(a => (
          <motion.button key={a.label} whileTap={{ scale: 0.94 }} onClick={() => navigate(a.route)}
            className="glass-card flex flex-col items-center gap-2 p-3">
            <div className={`w-11 h-11 rounded-2xl ${a.color} flex items-center justify-center shadow`}>
              <a.icon size={20} className="text-white" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 text-center leading-tight">{a.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Recovery shortcut */}
      <Card onClick={() => navigate('recovery')} className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold text-slate-800 dark:text-white text-sm">{t('home.recovery_progress')}</p>
          <p className="text-xs text-slate-500">{t('home.view_trends')}</p>
        </div>
        <ChevronRight size={20} className="text-slate-400" />
      </Card>

      {/* Discharge summary */}
      <Button variant="outline" className="w-full" onClick={() => setShowSummary(true)}><FileText size={16} /> {t('home.download_summary')}</Button>

      <DischargeSummary open={showSummary} onClose={() => setShowSummary(false)} />
    </div>
  );
}

function VitalCard({ icon: Icon, color, label, value, unit }: { icon: typeof Heart; color: string; label: string; value: string; unit: string }) {
  return (
    <Card className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-bold text-slate-800 dark:text-white">{value} <span className="text-xs font-normal text-slate-400">{unit}</span></p>
      </div>
    </Card>
  );
}

function diffMins(now: Date, time: string) {
  const [h, m] = time.split(':').map(Number);
  const target = new Date(now); target.setHours(h, m, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 60000);
}
function formatMins(m: number) {
  if (m < 60) return `${m} mins`;
  const h = Math.floor(m / 60), mm = m % 60;
  return `${h} hr ${mm} mins`;
}
