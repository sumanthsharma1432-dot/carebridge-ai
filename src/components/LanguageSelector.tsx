import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useStore } from '@/store';
import { LANGUAGES } from '@/i18n';
import { LanguageManager } from '@/components/LanguageManager';

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { state } = useStore();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find(l => l.label === state.language) || LANGUAGES[0];

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm font-medium text-slate-700 dark:text-slate-200">
        <Globe size={16} />
        {!compact && <span>{current.flag}</span>}
        {!compact && <span className="hidden sm:inline">{current.label}</span>}
        {compact && <span>{current.flag}</span>}
      </button>
      <LanguageManager open={open} onClose={() => setOpen(false)} />
    </>
  );
}
