import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Scan, X, CheckCircle2, AlertTriangle, ShieldAlert, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Chip } from '@/components/ui';

type Result = { level: 'green' | 'yellow' | 'red'; title: string; desc: string };

export function WoundScanner({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const RESULTS: Result[] = [
    { level: 'green', title: t('wound_scanner.result_healing'), desc: t('wound_scanner.desc_healing') },
    { level: 'yellow', title: t('wound_scanner.result_redness'), desc: t('wound_scanner.desc_redness') },
    { level: 'red', title: t('wound_scanner.result_infection'), desc: t('wound_scanner.desc_infection') },
  ];

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setPhoto(reader.result as string); setResult(null); };
    reader.readAsDataURL(f);
  };

  const scan = () => {
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      setResult(RESULTS[Math.floor(Math.random() * RESULTS.length)]);
    }, 2400);
  };

  const reset = () => { setPhoto(null); setResult(null); };

  const cfg = {
    green: { Icon: CheckCircle2, color: 'text-success-600', bg: 'bg-success-100 dark:bg-success-700/30', chip: 'success' as const },
    yellow: { Icon: AlertTriangle, color: 'text-warning-600', bg: 'bg-warning-100 dark:bg-warning-500/20', chip: 'warning' as const },
    red: { Icon: ShieldAlert, color: 'text-danger-600', bg: 'bg-danger-100 dark:bg-danger-500/20', chip: 'danger' as const },
  };

  return (
    <Card className={compact ? '' : 'mb-4'}>
      <p className="font-bold text-slate-800 dark:text-white text-sm mb-3 flex items-center gap-2">
        <Scan size={16} className="text-primary-600" /> {t('wound_scanner.title')}
      </p>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} />

      {!photo && (
        <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl py-8 flex flex-col items-center gap-2 text-slate-400 hover:border-primary-400 hover:text-primary-500 transition">
          <Camera size={32} />
          <span className="text-sm font-medium">{t('wound_scanner.upload_hint')}</span>
        </button>
      )}

      {photo && (
        <div className="relative rounded-2xl overflow-hidden">
          <img src={photo} alt="wound" className="w-full h-48 object-cover" />
          <button onClick={reset} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"><X size={16} /></button>

          <AnimatePresence>
            {scanning && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary-900/30 backdrop-blur-sm flex flex-col items-center justify-center">
                <motion.div animate={{ y: [0, 180, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-2 left-0 right-0 h-0.5 bg-primary-400 shadow-glow" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-white text-sm font-semibold flex items-center gap-2">
                  <Scan size={18} /> {t('wound_scanner.analyzing')}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-3 p-3 rounded-xl flex items-start gap-3 ${cfg[result.level].bg}`}>
            {(() => {
              const C = cfg[result.level];
              return <C.Icon size={22} className={`${C.color} shrink-0`} />;
            })()}
            <div>
              <Chip color={cfg[result.level].chip}>{result.title}</Chip>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5">{result.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {photo && !scanning && (
        <div className="flex gap-2 mt-3">
          {!result && <Button className="flex-1" onClick={scan}><Scan size={16} /> {t('wound_scanner.run_scan')}</Button>}
          {result && <Button variant="outline" className="flex-1" onClick={scan}><Scan size={16} /> {t('wound_scanner.scan_again')}</Button>}
          <Button variant="ghost" onClick={() => fileRef.current?.click()}><Upload size={16} /> {t('wound_scanner.new_photo')}</Button>
        </div>
      )}
    </Card>
  );
}
