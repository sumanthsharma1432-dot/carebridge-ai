import { motion } from 'framer-motion';
import { Home, ClipboardList, Pill, BrainCircuit, MessageCircle, Stethoscope, Users, Shield } from 'lucide-react';
import { useRouter, type Route } from '@/router';
import { useStore } from '@/store';

export function BottomNav() {
  const { route, navigate } = useRouter();
  const { state } = useStore();

  if (state.role === 'doctor') {
    const items: { id: Route; label: string; icon: typeof Home }[] = [
      { id: 'doctor-home', label: 'Patients', icon: Users },
      { id: 'doctor-telehealth', label: 'Telehealth', icon: MessageCircle },
      { id: 'admin', label: 'Admin', icon: Shield },
      { id: 'profile', label: 'Profile', icon: Stethoscope },
    ];
    return <Nav items={items} route={route} navigate={navigate} />;
  }

  const items: { id: Route; label: string; icon: typeof Home }[] = [
    { id: 'patient-home', label: 'Home', icon: Home },
    { id: 'checkin', label: 'Check-in', icon: ClipboardList },
    { id: 'medication', label: 'Meds', icon: Pill },
    { id: 'ai-analysis', label: 'AI', icon: BrainCircuit },
    { id: 'doctor-chat', label: 'Doctor', icon: MessageCircle },
  ];
  return <Nav items={items} route={route} navigate={navigate} />;
}

function Nav({ items, route, navigate }: { items: { id: Route; label: string; icon: typeof Home }[]; route: Route; navigate: (r: Route) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-md mx-auto px-2 flex items-center justify-around h-16">
        {items.map(it => {
          const active = route === it.id || (it.id === 'doctor-telehealth' && route === 'video-call');
          return (
            <button key={it.id} onClick={() => navigate(it.id)} className="relative flex flex-col items-center justify-center gap-0.5 w-16 h-full">
              {active && <motion.div layoutId="navdot" className="absolute -top-px w-8 h-1 rounded-full bg-primary-600" />}
              <it.icon size={22} className={active ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500'} />
              <span className={`text-[10px] font-medium ${active ? 'text-primary-600' : 'text-slate-400 dark:text-slate-500'}`}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
