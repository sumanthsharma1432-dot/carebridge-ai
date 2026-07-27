import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Video, Building2, Calendar, Clock, Check, ChevronRight, ChevronLeft, Stethoscope } from 'lucide-react';
import { useRouter } from '@/router';
import { useStore } from '@/store';
import { Card, Button, Chip, PageHeader } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { useTranslation } from 'react-i18next';

const DOCTORS = [
  { id: 'd1', name: 'Dr. Michael Chen', specialty: 'Orthopedics', avatar: 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&w=200', rating: 4.9, available: true },
  { id: 'd2', name: 'Dr. Emily Roberts', specialty: 'Cardiology', avatar: 'https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg?auto=compress&w=200', rating: 4.8, available: true },
  { id: 'd3', name: 'Dr. James Park', specialty: 'Post-Op Care', avatar: 'https://images.pexels.com/photos/6234600/pexels-photo-6234600.jpeg?auto=compress&w=200', rating: 4.7, available: false },
  { id: 'd4', name: 'Dr. Sarah Williams', specialty: 'General Surgery', avatar: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&w=200', rating: 4.9, available: true },
  { id: 'd5', name: 'Dr. Robert Kim', specialty: 'Orthopedics', avatar: 'https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&w=200', rating: 4.6, available: true },
];

const SPECIALTY_KEYS = ['all', 'orthopedics', 'cardiology', 'postop', 'general_surgery'];

const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() + i + 1);
  return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) };
});

const MORNING_SLOTS = ['08:00', '09:00', '10:00', '11:00'];
const AFTERNOON_SLOTS = ['13:00', '14:00', '15:00', '16:00'];

function formatTime(slot: string): string {
  const [h, m] = slot.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function AppointmentBooking() {
  const { back } = useRouter();
  const { state, setState } = useStore();
  const { show } = useToast();
  const { t } = useTranslation();

  const SPECIALTIES = SPECIALTY_KEYS.map(k => ({ key: k, label: t(`appointment.spec_${k}`) }));

  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState<typeof DOCTORS[0] | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [type, setType] = useState<'inperson' | 'telehealth' | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const filtered = DOCTORS.filter(d =>
    (specialty === 'all' || d.specialty === SPECIALTIES.find(s => s.key === specialty)?.label || d.specialty === specialty) &&
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  const confirm = () => {
    if (!selectedDoctor || !date || !slot || !type) return;
    const dateLabel = DATES.find(d => d.key === date)?.label || date;
    const typeLabel = type === 'telehealth' ? t('appointment.type_video') : t('appointment.type_inperson');
    setState(s => {
      const patients = [...s.patients];
      patients[0] = { ...patients[0], nextAppointment: { doctor: selectedDoctor.name, date: dateLabel, time: formatTime(slot), type: typeLabel } };
      return { ...s, patients };
    });
    setConfirmed(true);
    show({ type: 'success', title: t('appointment.confirmed_toast'), body: t('appointment.confirmed_body', { name: selectedDoctor.name, date: dateLabel, time: formatTime(slot) }) });
  };

  const reset = () => { setSelectedDoctor(null); setDate(null); setSlot(null); setType(null); setConfirmed(false); };

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <button onClick={back} className="mb-3 text-slate-400 flex items-center gap-1 text-sm"><ArrowLeft size={16} /> {t('common.back')}</button>
      <PageHeader title={t('appointment.title')} subtitle={t('appointment.subtitle')} />

      <AnimatePresence mode="wait">
        {confirmed ? (
          <motion.div key="conf" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-700/30 flex items-center justify-center mx-auto mb-3">
              <Check size={36} className="text-success-600" />
            </div>
            <p className="font-extrabold text-lg text-slate-800 dark:text-white mb-1">{t('appointment.confirmed')}</p>
            <p className="text-sm text-slate-500 mb-4">{selectedDoctor?.name} · {DATES.find(d => d.key === date)?.label} at {formatTime(slot || '')}</p>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={reset}>{t('appointment.book_another')}</Button>
              <Button className="flex-1" onClick={() => back()}>{t('common.done')}</Button>
            </div>
          </motion.div>
        ) : !selectedDoctor ? (
          <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="relative mb-3">
              <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input className="input pl-11" placeholder={t('appointment.search_doctors')} value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {SPECIALTIES.map(s => (
                <button key={s.key} onClick={() => setSpecialty(s.key)} className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${specialty === s.key ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{s.label}</button>
              ))}
            </div>
            <div className="space-y-3">
              {filtered.map(d => (
                <Card key={d.id} onClick={() => d.available && setSelectedDoctor(d)} className={d.available ? '' : 'opacity-50'}>
                  <div className="flex items-center gap-3">
                    <img src={d.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-white text-sm">{d.name}</p>
                      <p className="text-xs text-slate-500">{d.specialty} · ⭐ {d.rating}</p>
                      <Chip color={d.available ? 'success' : 'slate'}>{d.available ? t('common.available') : t('common.unavailable')}</Chip>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="book" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Card className="mb-4 flex items-center gap-3">
              <button onClick={() => { setSelectedDoctor(null); setDate(null); setSlot(null); setType(null); }} className="text-slate-400"><ChevronLeft size={18} /></button>
              <img src={selectedDoctor.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-bold text-slate-800 dark:text-white text-sm">{selectedDoctor.name}</p>
                <p className="text-xs text-slate-500">{selectedDoctor.specialty}</p>
              </div>
            </Card>

            <p className="font-bold text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2"><Calendar size={14} /> {t('appointment.select_date')}</p>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {DATES.map(d => (
                <button key={d.key} onClick={() => { setDate(d.key); setSlot(null); }}
                  className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition ${date === d.key ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {d.label}
                </button>
              ))}
            </div>

            {date && (
              <>
                <p className="font-bold text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2"><Clock size={14} /> {t('appointment.select_time')}</p>
                <p className="text-xs text-slate-500 mb-1.5">{t('appointment.morning')}</p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {MORNING_SLOTS.map(s => (
                    <button key={s} onClick={() => setSlot(s)} className={`py-2 rounded-xl text-xs font-semibold border transition ${slot === s ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>{s}</button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mb-1.5">{t('appointment.afternoon')}</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {AFTERNOON_SLOTS.map(s => (
                    <button key={s} onClick={() => setSlot(s)} className={`py-2 rounded-xl text-xs font-semibold border transition ${slot === s ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>{s}</button>
                  ))}
                </div>
              </>
            )}

            {slot && (
              <>
                <p className="font-bold text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2"><Stethoscope size={14} /> {t('appointment.visit_type')}</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button onClick={() => setType('inperson')} className={`glass-card p-4 flex flex-col items-center gap-2 transition ${type === 'inperson' ? 'ring-2 ring-primary-500' : ''}`}>
                    <Building2 size={24} className="text-primary-600" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t('appointment.inperson')}</span>
                  </button>
                  <button onClick={() => setType('telehealth')} className={`glass-card p-4 flex flex-col items-center gap-2 transition ${type === 'telehealth' ? 'ring-2 ring-primary-500' : ''}`}>
                    <Video size={24} className="text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{t('appointment.telehealth')}</span>
                  </button>
                </div>
              </>
            )}

            <Button className="w-full" disabled={!date || !slot || !type} onClick={confirm}>
              <Check size={16} /> {t('appointment.confirm')}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
