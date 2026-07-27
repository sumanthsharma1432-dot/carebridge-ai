import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { ArrowLeft, Award, TrendingUp, Flame, Lock } from 'lucide-react';
import { useStore } from '@/store';
import { useRouter } from '@/router';
import { Card, PageHeader, Chip } from '@/components/ui';
import { useTranslation } from 'react-i18next';

export function Recovery() {
  const { state } = useStore();
  const { back } = useRouter();
  const { t } = useTranslation();

  const badges = [
    { name: t('recovery.badge_1'), unlocked: true, icon: '🏆', color: 'from-amber-400 to-orange-500' },
    { name: t('recovery.badge_2'), unlocked: true, icon: '💚', color: 'from-emerald-400 to-green-500' },
    { name: t('recovery.badge_3'), unlocked: true, icon: '🔥', color: 'from-orange-400 to-red-500' },
    { name: t('recovery.badge_4'), unlocked: false, icon: '✨', color: 'from-slate-300 to-slate-400' },
    { name: t('recovery.badge_5'), unlocked: false, icon: '💊', color: 'from-slate-300 to-slate-400' },
    { name: t('recovery.badge_6'), unlocked: false, icon: '👑', color: 'from-slate-300 to-slate-400' },
  ];
  const checkIns = [...state.patients[0].checkIns].reverse();

  const painData = checkIns.map(c => ({ day: c.date.slice(5), pain: c.pain }));
  const sleepData = checkIns.map(c => ({ day: c.date.slice(5), sleep: c.sleep }));
  const scoreData = checkIns.map((c, i) => ({ day: c.date.slice(5), score: 40 + i * 7 }));

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <button onClick={back} className="mb-3 text-slate-400 flex items-center gap-1 text-sm"><ArrowLeft size={16} /> {t('common.back')}</button>
      <PageHeader title={t('recovery.title')} subtitle={t('recovery.subtitle')} />

      {/* Summary */}
      <Card className="mb-4 bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm">{t('recovery.current_score')}</p>
            <p className="text-4xl font-extrabold">{state.patients[0].recoveryScore}%</p>
            <Chip color="success"><TrendingUp size={12} /> {t('recovery.pct_week')}</Chip>
          </div>
          <div className="text-right">
            <Flame size={32} className="text-orange-300 ml-auto mb-1" />
            <p className="text-2xl font-extrabold">{state.patients[0].streak}</p>
            <p className="text-xs text-primary-200">{t('recovery.day_streak')}</p>
          </div>
        </div>
        </Card>

      {/* Pain trend */}
      <Card className="mb-4">
        <p className="font-bold text-slate-800 dark:text-white text-sm mb-3">{t('recovery.pain_7days')}</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={painData}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={20} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
            <Line type="monotone" dataKey="pain" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Sleep trend */}
      <Card className="mb-4">
        <p className="font-bold text-slate-800 dark:text-white text-sm mb-3">{t('recovery.sleep_7days')}</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={sleepData}>
            <defs><linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0} /></linearGradient></defs>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={20} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
            <Area type="monotone" dataKey="sleep" stroke="#2563eb" strokeWidth={2.5} fill="url(#sleepGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Recovery score trend */}
      <Card className="mb-4">
        <p className="font-bold text-slate-800 dark:text-white text-sm mb-3">{t('recovery.score_trend')}</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={scoreData}>
            <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.4} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={24} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
            <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} fill="url(#scoreGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Achievements */}
      <div className="flex items-center gap-2 mb-3">
        <Award size={18} className="text-amber-500" />
        <p className="font-bold text-slate-800 dark:text-white">{t('recovery.achievements')}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {badges.map(b => (
          <motion.div key={b.name} whileTap={{ scale: 0.95 }} className={`glass-card p-3 flex flex-col items-center text-center ${!b.unlocked && 'opacity-60'}`}>
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${b.color} flex items-center justify-center text-2xl mb-2 ${!b.unlocked && 'grayscale'}`}>
              {b.unlocked ? b.icon : <Lock size={20} className="text-white" />}
            </div>
            <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">{b.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
