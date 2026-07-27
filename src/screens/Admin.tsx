import { Users, AlertTriangle, TrendingUp, Activity, Shield, ArrowLeft, UserPlus, Bell } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useStore } from '@/store';
import { useRouter } from '@/router';
import { Card, PageHeader, Chip, Button } from '@/components/ui';

const systemData = [
  { day: 'Mon', alerts: 4 }, { day: 'Tue', alerts: 2 }, { day: 'Wed', alerts: 5 }, { day: 'Thu', alerts: 3 }, { day: 'Fri', alerts: 6 }, { day: 'Sat', alerts: 1 }, { day: 'Sun', alerts: 2 },
];
const riskPie = [
  { name: 'Low', value: 14, color: '#10b981' },
  { name: 'Moderate', value: 7, color: '#f59e0b' },
  { name: 'High', value: 3, color: '#ef4444' },
];

export function Admin() {
  const { back } = useRouter();
  const { state } = useStore();

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <button onClick={back} className="mb-3 text-slate-400 flex items-center gap-1 text-sm"><ArrowLeft size={16} /> Back</button>
      <PageHeader title="Admin Panel" subtitle="System analytics & management" right={<Shield size={22} className="text-primary-600" />} />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="text-center"><div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-1"><Users size={18} className="text-primary-600" /></div><p className="text-2xl font-extrabold text-slate-800 dark:text-white">24</p><p className="text-xs text-slate-500">Total Patients</p></Card>
        <Card className="text-center"><div className="w-9 h-9 rounded-xl bg-success-100 dark:bg-success-700/30 flex items-center justify-center mx-auto mb-1"><UserPlus size={18} className="text-success-600" /></div><p className="text-2xl font-extrabold text-slate-800 dark:text-white">8</p><p className="text-xs text-slate-500">Doctors</p></Card>
        <Card className="text-center"><div className="w-9 h-9 rounded-xl bg-danger-100 dark:bg-danger-500/20 flex items-center justify-center mx-auto mb-1"><AlertTriangle size={18} className="text-danger-500" /></div><p className="text-2xl font-extrabold text-danger-500">{state.alerts.length}</p><p className="text-xs text-slate-500">Active Alerts</p></Card>
        <Card className="text-center"><div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-1"><TrendingUp size={18} className="text-amber-500" /></div><p className="text-2xl font-extrabold text-slate-800 dark:text-white">84%</p><p className="text-xs text-slate-500">Avg Recovery</p></Card>
      </div>

      <Card className="mb-4">
        <p className="font-bold text-slate-800 dark:text-white text-sm mb-3">System Alerts (7 days)</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={systemData}><XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} /><Bar dataKey="alerts" fill="#2563eb" radius={[4,4,0,0]} /></BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="mb-4">
        <p className="font-bold text-slate-800 dark:text-white text-sm mb-3">Patient Risk Distribution</p>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={riskPie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
              {riskPie.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2">
          {riskPie.map(r => <div key={r.name} className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{ background: r.color }} /><span className="text-xs text-slate-600 dark:text-slate-300">{r.name} ({r.value})</span></div>)}
        </div>
      </Card>

      <Card className="mb-4">
        <p className="font-bold text-slate-800 dark:text-white text-sm mb-3">Recovery Trend (All Patients)</p>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={[{ w: 'W1', s: 62 }, { w: 'W2', s: 71 }, { w: 'W3', s: 78 }, { w: 'W4', s: 84 }]}>
            <XAxis dataKey="w" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} hide /><Tooltip /><Line type="monotone" dataKey="s" stroke="#10b981" strokeWidth={2.5} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <p className="font-bold text-slate-800 dark:text-white mb-3">Doctor Onboarding</p>
      <Card className="mb-4">
        <div className="space-y-3">
          {['Dr. Michael Chen', 'Dr. Emily Roberts', 'Dr. James Park'].map(d => (
            <div key={d} className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Activity size={14} className="text-success-500" /><span className="text-sm text-slate-700 dark:text-slate-200">{d}</span></div>
              <Chip color="success">Active</Chip>
            </div>
          ))}
          {['Dr. Lisa Wong'].map(d => (
            <div key={d} className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Activity size={14} className="text-warning-500" /><span className="text-sm text-slate-700 dark:text-slate-200">{d}</span></div>
              <Chip color="warning">Pending</Chip>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-3"><UserPlus size={16} /> Invite Doctor</Button>
      </Card>

      <p className="font-bold text-slate-800 dark:text-white mb-3">System Alerts</p>
      <div className="space-y-2">
        {state.alerts.map(a => (
          <Card key={a.id} className="flex items-start gap-3">
            <Bell size={16} className={a.level === 'high' ? 'text-danger-500' : 'text-warning-500'} />
            <div className="flex-1"><p className="text-sm font-semibold text-slate-800 dark:text-white">{a.type} Alert</p><p className="text-xs text-slate-500">{a.message}</p></div>
            <span className="text-[10px] text-slate-400">{a.time}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
