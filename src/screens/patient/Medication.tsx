import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, Check, X, Plus, ArrowLeft, Clock, History, ScanLine } from 'lucide-react';
import { useStore } from '@/store';
import { useRouter } from '@/router';
import { Card, Button, Chip, PageHeader } from '@/components/ui';
import { MedicineScanner, type ScannedMedication } from '@/components/MedicineScanner';
import { useToast } from '@/components/Toast';

export function Medication() {
  const { state, setState } = useStore();
  const { back } = useRouter();
  const { show } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', time: '08:00', instructions: '' });

  const meds = state.patients[0].medications;

  const toggle = (id: string, taken: boolean) => {
    setState(s => {
      const patients = [...s.patients];
      patients[0] = { ...patients[0], medications: patients[0].medications.map(m => m.id === id ? { ...m, taken, missed: !taken } : m) };
      return { ...s, patients };
    });
  };

  const addMed = () => {
    if (!newMed.name) return;
    setState(s => {
      const patients = [...s.patients];
      patients[0] = { ...patients[0], medications: [...patients[0].medications, { id: 'm' + Date.now(), ...newMed, taken: false }] };
      return { ...s, patients };
    });
    setNewMed({ name: '', dosage: '', time: '08:00', instructions: '' });
    setShowAdd(false);
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <button onClick={back} className="mb-3 text-slate-400 flex items-center gap-1 text-sm"><ArrowLeft size={16} /> Back</button>
      <PageHeader title="Medications" subtitle="Daily schedule & adherence" right={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setShowScanner(true)}><ScanLine size={16} /> Scan</Button>
          <Button variant="ghost" onClick={() => setShowAdd(true)}><Plus size={16} /> Add</Button>
        </div>
      } />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Card className="text-center"><p className="text-2xl font-extrabold text-success-600">{meds.filter(m => m.taken).length}</p><p className="text-xs text-slate-500">Taken</p></Card>
        <Card className="text-center"><p className="text-2xl font-extrabold text-warning-500">{meds.filter(m => !m.taken && !m.missed).length}</p><p className="text-xs text-slate-500">Pending</p></Card>
        <Card className="text-center"><p className="text-2xl font-extrabold text-danger-500">{meds.filter(m => m.missed).length}</p><p className="text-xs text-slate-500">Missed</p></Card>
      </div>

      <p className="font-bold text-slate-800 dark:text-white mb-3">Today's Schedule</p>
      <div className="space-y-3 mb-6">
        {meds.map(m => (
          <Card key={m.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${m.taken ? 'bg-success-100 dark:bg-success-900/30' : m.missed ? 'bg-danger-100 dark:bg-danger-500/20' : 'bg-primary-100 dark:bg-primary-900/30'}`}>
                  <Pill size={20} className={m.taken ? 'text-success-600' : m.missed ? 'text-danger-500' : 'text-primary-600'} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">{m.name} {m.dosage}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={11} /> {m.time} · {m.instructions}</p>
                </div>
              </div>
              {m.taken ? (
                <Chip color="success"><Check size={12} /> Taken</Chip>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => toggle(m.id, false)} className="w-9 h-9 rounded-lg bg-danger-100 dark:bg-danger-500/20 flex items-center justify-center"><X size={16} className="text-danger-500" /></button>
                  <button onClick={() => toggle(m.id, true)} className="w-9 h-9 rounded-lg bg-success-100 dark:bg-success-900/30 flex items-center justify-center"><Check size={16} className="text-success-600" /></button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <p className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2"><History size={16} /> History Log</p>
      <Card>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">Amoxicillin 500mg</span><Chip color="success">Yesterday · Taken</Chip></div>
          <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">Ibuprofen 400mg</span><Chip color="success">Yesterday · Taken</Chip></div>
          <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">Cetirizine 10mg</span><Chip color="danger">2 days ago · Missed</Chip></div>
          <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-300">Amoxicillin 500mg</span><Chip color="success">2 days ago · Taken</Chip></div>
        </div>
      </Card>

      <MedicineScanner open={showScanner} onClose={() => setShowScanner(false)} onScan={(med: ScannedMedication) => {
        setState(s => {
          const patients = [...s.patients];
          patients[0] = { ...patients[0], medications: [...patients[0].medications, { id: 'm' + Date.now(), name: med.name, dosage: med.dosage, time: med.time, instructions: med.instructions, taken: false }] };
          return { ...s, patients };
        });
        show({ type: 'success', title: 'Medication added from scan', body: `${med.name} ${med.dosage} · expires ${med.expiration}` });
      }} />

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="glass-card w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
              <p className="font-bold text-slate-800 dark:text-white mb-4">Add Medication Reminder</p>
              <div className="space-y-3">
                <input className="input" placeholder="Medication name" value={newMed.name} onChange={e => setNewMed({ ...newMed, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="input" placeholder="Dosage (e.g. 200mg)" value={newMed.dosage} onChange={e => setNewMed({ ...newMed, dosage: e.target.value })} />
                  <input type="time" className="input" value={newMed.time} onChange={e => setNewMed({ ...newMed, time: e.target.value })} />
                </div>
                <input className="input" placeholder="Instructions" value={newMed.instructions} onChange={e => setNewMed({ ...newMed, instructions: e.target.value })} />
                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" className="flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={addMed}>Add Reminder</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
