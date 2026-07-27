import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Scan, X, Upload, Check, Pill } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';

export interface ScannedMedication {
  name: string;
  dosage: string;
  time: string;
  instructions: string;
  expiration: string;
}

const SAMPLE_RESULTS: ScannedMedication[] = [
  { name: 'Amoxicillin', dosage: '500mg', time: '08:00', instructions: 'Take with food, twice daily', expiration: '2025-11-30' },
  { name: 'Ibuprofen', dosage: '400mg', time: '14:00', instructions: 'After meals, every 6 hours', expiration: '2026-03-15' },
  { name: 'Metformin', dosage: '850mg', time: '19:00', instructions: 'With dinner, once daily', expiration: '2025-08-22' },
  { name: 'Cetirizine', dosage: '10mg', time: '21:00', instructions: 'Before bed, once daily', expiration: '2026-01-10' },
];

export function MedicineScanner({ open, onClose, onScan }: { open: boolean; onClose: () => void; onScan: (med: ScannedMedication) => void }) {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScannedMedication | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
      setResult(SAMPLE_RESULTS[Math.floor(Math.random() * SAMPLE_RESULTS.length)]);
    }, 2600);
  };

  const useResult = () => {
    if (result) { onScan(result); reset(); onClose(); }
  };

  const reset = () => { setPhoto(null); setResult(null); setScanning(false); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => { reset(); onClose(); }}>
          <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} transition={{ type: 'spring' }} className="glass-card w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Scan size={18} className="text-primary-600" /> {t('medicine_scanner.title')}</p>
              <button onClick={() => { reset(); onClose(); }}><X size={20} className="text-slate-400" /></button>
            </div>

            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} />

            {!photo && (
              <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl py-10 flex flex-col items-center gap-2 text-slate-400 hover:border-primary-400 hover:text-primary-500 transition">
                <Camera size={36} />
                <span className="text-sm font-medium">{t('medicine_scanner.upload_hint')}</span>
              </button>
            )}

            {photo && (
              <div className="relative rounded-2xl overflow-hidden mb-3">
                <img src={photo} alt="medication" className="w-full h-44 object-cover" />
                <button onClick={reset} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"><X size={16} /></button>
                <AnimatePresence>
                  {scanning && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-primary-900/30 backdrop-blur-sm flex flex-col items-center justify-center">
                      <motion.div animate={{ y: [0, 160, 0] }} transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-2 left-0 right-0 h-0.5 bg-primary-400 shadow-glow" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-white text-sm font-semibold flex items-center gap-2">
                        <Scan size={18} /> {t('medicine_scanner.reading')}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 p-4 rounded-xl bg-success-50 dark:bg-success-700/20 border border-success-200 dark:border-success-700">
                <p className="text-xs font-bold text-success-700 dark:text-success-400 mb-2 flex items-center gap-1"><Check size={14} /> {t('medicine_scanner.scan_complete')}</p>
                <div className="space-y-1.5 text-sm">
                  <Row label={t('medicine_scanner.row_medication')} value={result.name} />
                  <Row label={t('medicine_scanner.row_dosage')} value={result.dosage} />
                  <Row label={t('medicine_scanner.row_frequency')} value={result.time} />
                  <Row label={t('medicine_scanner.row_instructions')} value={result.instructions} />
                  <Row label={t('medicine_scanner.row_expiration')} value={result.expiration} />
                </div>
              </motion.div>
            )}

            {photo && !scanning && !result && (
              <Button className="w-full mb-2" onClick={scan}><Scan size={16} /> {t('medicine_scanner.run_scan')}</Button>
            )}
            {result && (
              <Button className="w-full mb-2" onClick={useResult}><Pill size={16} /> {t('medicine_scanner.add_to_meds')}</Button>
            )}
            {photo && (
              <Button variant="ghost" className="w-full" onClick={() => fileRef.current?.click()}><Upload size={16} /> {t('medicine_scanner.new_photo')}</Button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-slate-500">{label}</span><span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span></div>;
}
