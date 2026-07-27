import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useStore } from '@/store';
import { LANGUAGES, type LangKey } from '@/i18n';

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { state, update } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.key === state.language?.slice(0, 2)) || LANGUAGES[0];

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm font-medium text-slate-700 dark:text-slate-200">
        <Globe size={16} />
        {!compact && <span>{current.flag}</span>}
        {!compact && <span className="hidden sm:inline">{current.label}</span>}
        {compact && <span>{current.flag}</span>}
        <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 glass-card p-1 z-50 shadow-xl">
          {LANGUAGES.map(l => (
            <button key={l.key} onClick={() => { update({ language: l.key }); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${current.key === l.key ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 font-semibold' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <span>{l.flag}</span><span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
