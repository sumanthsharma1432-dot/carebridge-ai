import { useState } from 'react';
import { Watch, RefreshCw, Check, Heart, Activity, Droplet, Footprints, Moon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { useRouter } from '@/router';
import { Card, Button, PageHeader, Chip } from '@/components/ui';

const DEVICES = [
  { name: 'Apple Watch', status: 'Connected', live: true, icon: '⌚', color: 'bg-slate-800' },
  { name: 'Samsung Galaxy Watch', status: 'Disconnected', live: false, icon: '⌚', color: 'bg-blue-600' },
  { name: 'Fitbit Charge', status: 'Connected', live: true, icon: '⌚', color: 'bg-teal-500' },
  { name: 'Pulse Oximeter', status: 'Disconnected', live: false, icon: '🩺', color: 'bg-rose-500' },
];

export function Wearables() {
  const { state } = useStore();
  const { back } = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [v, setV] = useState(state.patients[0].vitals);

  const sync = () => {
    setSyncing(true);
    setTimeout(() => {
      setV(prev => ({
        ...prev,
        heartRate: 68 + Math.floor(Math.random() * 12),
        steps: prev.steps + Math.floor(Math.random() * 400),
        oxygen: 96 + Math.floor(Math.random() * 4),
        lastSync: 'Just now',
      }));
      setSyncing(false);
    }, 1500);
  };

  const metrics = [
    { icon: Heart, label: 'Heart Rate', value: v.heartRate, unit: 'bpm', color: 'text-danger-500' },
    { icon: Footprints, label: 'Daily Steps', value: v.steps.toLocaleString(), unit: 'steps', color: 'text-emerald-500' },
    { icon: Droplet, label: 'Blood Oxygen', value: v.oxygen, unit: '%', color: 'text-cyan-500' },
    { icon: Moon, label: 'Sleep Duration', value: v.sleepHours, unit: 'hrs', color: 'text-primary-500' },
  ];

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <button onClick={back} className="mb-3 text-slate-400 flex items-center gap-1 text-sm"><ArrowLeft size={16} /> Back</button>
      <PageHeader title="Wearable Devices" subtitle="Sync & monitor connected devices" right={
        <Button variant="ghost" onClick={sync}>{syncing ? <RefreshCw size={16} className="animate-spin" /> : 'Sync Now'}</Button>
      } />

      <div className="space-y-3 mb-6">
        {DEVICES.map(d => (
          <Card key={d.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${d.color} flex items-center justify-center text-lg`}>{d.icon}</div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white text-sm">{d.name}</p>
                <p className="text-xs text-slate-500">{d.status}</p>
              </div>
            </div>
            <Chip color={d.live ? 'success' : 'slate'}>
              {d.live ? <><span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" /> Live Sync</> : 'Offline'}
            </Chip>
          </Card>
        ))}
      </div>

      <p className="font-bold text-slate-800 dark:text-white mb-3">Auto-Synced Metrics</p>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map(m => (
          <motion.div key={m.label} animate={syncing ? { opacity: 0.4 } : { opacity: 1 }}>
            <Card className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <m.icon size={18} className={m.color} />
                <span className="text-xs text-slate-500">{m.label}</span>
              </div>
              <p className="font-bold text-slate-800 dark:text-white text-lg">{m.value} <span className="text-xs font-normal text-slate-400">{m.unit}</span></p>
            </Card>
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-slate-400 text-center mt-4">Last synced {v.lastSync} via {v.syncedVia}</p>
    </div>
  );
}
