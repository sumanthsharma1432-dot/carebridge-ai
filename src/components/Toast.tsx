import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, X, MessageSquare } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'sms' | 'info';
export interface Toast { id: string; type: ToastType; title: string; body?: string }

interface ToastCtx { show: (t: Omit<Toast, 'id'>) => void }
const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((t: Omit<Toast, 'id'>) => {
    const id = 'toast_' + Date.now();
    setToasts(p => [...p, { ...t, id }]);
    setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), 4500);
  }, []);
  const dismiss = (id: string) => setToasts(p => p.filter(x => x.id !== id));

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              className={`pointer-events-auto rounded-2xl shadow-xl p-4 flex items-start gap-3 border ${
                t.type === 'sms' ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700' :
                t.type === 'error' ? 'bg-danger-50 dark:bg-danger-900/40 border-danger-200 dark:border-danger-700' :
                'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {t.type === 'sms' && <MessageSquare size={20} className="text-emerald-600" />}
                {t.type === 'error' && <AlertTriangle size={20} className="text-danger-500" />}
                {(t.type === 'success' || t.type === 'info') && <CheckCircle2 size={20} className="text-success-500" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-800 dark:text-white">{t.title}</p>
                {t.body && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.body}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
