import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, Download, Globe, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, setLanguage, type LangInfo } from '@/i18n';
import { useStore } from '@/store';
import { useToast } from '@/components/Toast';

export function LanguageManager({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { state, update } = useStore();
  const { show } = useToast();
  const [query, setQuery] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  const activeCode = LANGUAGES.find(l => l.label === state.language)?.code || 'en';
  const downloaded = new Set<string>([activeCode, 'en']);

  const filtered = LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(query.toLowerCase()) ||
    l.nativeLabel.toLowerCase().includes(query.toLowerCase())
  );

  const activate = (lang: LangInfo) => {
    if (!downloaded.has(lang.code)) {
      setDownloading(lang.code);
      setTimeout(() => {
        setDownloading(null);
        downloaded.add(lang.code);
        update({ language: lang.label });
        setLanguage(lang.code);
        show({ type: 'success', title: t('language_manager.downloaded'), body: lang.nativeLabel });
      }, 1200);
    } else {
      update({ language: lang.label });
      setLanguage(lang.code);
      show({ type: 'success', title: t('language_manager.active'), body: lang.nativeLabel });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="glass-card w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[80vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Globe size={20} className="text-primary-600" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{t('language_manager.title')}</p>
                  <p className="text-xs text-slate-500">{t('language_manager.subtitle')}</p>
                </div>
              </div>
              <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
            </div>

            <div className="relative p-4 shrink-0">
              <Search size={18} className="absolute left-7 top-7 text-slate-400" />
              <input
                className="input pl-11"
                placeholder={t('language_manager.search_placeholder')}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
              {filtered.map(lang => {
                const isActive = lang.code === activeCode;
                const isDownloaded = downloaded.has(lang.code);
                const isDownloading = downloading === lang.code;
                return (
                  <div
                    key={lang.code}
                    className={`glass-card flex items-center gap-3 p-3 ${isActive ? 'ring-2 ring-primary-500' : ''}`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">{lang.nativeLabel}</p>
                      <p className="text-xs text-slate-500">{lang.label} {lang.rtl && `· ${t('language_manager.rtl_note')}`}</p>
                    </div>
                    {isActive ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-success-600">
                        <Check size={14} /> {t('language_manager.active')}
                      </span>
                    ) : isDownloading ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary-600">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Download size={14} /></motion.span>
                        {t('language_manager.downloading')}
                      </span>
                    ) : (
                      <button
                        onClick={() => activate(lang)}
                        className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                      >
                        {isDownloaded ? t('language_manager.activate') : <><Download size={14} /> {t('language_manager.download')}</>}
                      </button>
                    )}
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-8">{t('language_manager.search_placeholder')}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
