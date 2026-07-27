import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Route =
  | 'splash' | 'onboarding' | 'login'
  | 'patient-home' | 'checkin' | 'medication' | 'ai-analysis' | 'recovery'
  | 'wearables' | 'sos' | 'doctor-chat' | 'video-call'
  | 'symptom-checker' | 'book-appointment'
  | 'doctor-home' | 'doctor-patient' | 'doctor-telehealth'
  | 'profile' | 'settings' | 'admin';

interface NavCtx {
  route: Route;
  params: Record<string, string>;
  navigate: (r: Route, params?: Record<string, string>) => void;
  back: () => void;
}

const Ctx = createContext<NavCtx | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>('splash');
  const [params, setParams] = useState<Record<string, string>>({});
  const [stack, setStack] = useState<Route[]>([]);

  const navigate = (r: Route, p: Record<string, string> = {}) => {
    setStack(s => [...s, route]);
    setParams(p);
    setRoute(r);
    window.scrollTo(0, 0);
  };
  const back = () => {
    setStack(s => {
      if (s.length === 0) return s;
      const prev = s[s.length - 1];
      setRoute(prev);
      return s.slice(0, -1);
    });
  };

  return <Ctx.Provider value={{ route, params, navigate, back }}>{children}</Ctx.Provider>;
}

export function useRouter() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
