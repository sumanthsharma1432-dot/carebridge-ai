import { User, Heart, AlertTriangle, Phone, Shield, ArrowLeft, Settings, LogOut, Stethoscope, Plus, X, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/store';
import { useRouter } from '@/router';
import { Card, Chip, PageHeader, Button } from '@/components/ui';
import { useToast } from '@/components/Toast';

export function Profile() {
  const { state, update } = useStore();
  const { navigate, back } = useRouter();
  const { show } = useToast();
  const p = state.patients[0];
  const isDoctor = state.role === 'doctor';
  const [editing, setEditing] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });

  const addContact = () => {
    if (!newContact.name || !newContact.phone) return;
    const patients = [...state.patients];
    patients[0] = { ...patients[0], emergencyContacts: [...patients[0].emergencyContacts, newContact] };
    update({ patients });
    setNewContact({ name: '', phone: '', relation: '' });
    show({ type: 'success', title: 'Emergency contact added', body: `${newContact.name} will receive SOS alerts` });
  };
  const removeContact = (name: string) => {
    const patients = [...state.patients];
    patients[0] = { ...patients[0], emergencyContacts: patients[0].emergencyContacts.filter(c => c.name !== name) };
    update({ patients });
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <button onClick={back} className="mb-3 text-slate-400 flex items-center gap-1 text-sm"><ArrowLeft size={16} /> Back</button>
      <PageHeader title="Profile" />

      {/* Avatar card */}
      <Card className="mb-4 text-center bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0">
        <img src={isDoctor ? 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&w=200' : p.avatar} alt="" className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-white/30" />
        <p className="font-bold text-lg mt-2">{isDoctor ? 'Dr. Michael Chen' : p.name}</p>
        <p className="text-primary-100 text-xs">{isDoctor ? 'Orthopedic Surgeon · CareBridge Hospital' : `${p.age} yrs · ${p.gender} · Blood ${p.bloodGroup}`}</p>
        <div className="flex justify-center gap-2 mt-3">
          <span className="chip bg-white/15 text-white">{state.role === 'doctor' ? 'Doctor' : 'Patient'}</span>
          <span className="chip bg-white/15 text-white">Premium</span>
        </div>
      </Card>

      {isDoctor ? (
        <>
          <Card className="mb-3"><p className="font-bold text-slate-800 dark:text-white text-sm mb-2">Doctor Info</p><Row label="Specialty" value="Orthopedic Surgery" /><Row label="License" value="MD-992311" /><Row label="Patients" value="24 active" /><Row label="Experience" value="14 years" /></Card>
        </>
      ) : (
        <>
          <Card className="mb-3"><p className="font-bold text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2"><Heart size={16} className="text-danger-500" /> Medical History</p>{p.medicalHistory.map(h => <div key={h} className="text-sm text-slate-600 dark:text-slate-300 py-1">{h}</div>)}</Card>
          <Card className="mb-3"><p className="font-bold text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-warning-500" /> Allergies</p><div className="flex flex-wrap gap-2">{p.allergies.map(a => <Chip key={a} color="warning">{a}</Chip>)}</div></Card>
          <Card className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2"><Phone size={16} className="text-primary-500" /> Family & Emergency Contacts</p>
              <button onClick={() => setEditing(e => !e)} className="text-xs text-primary-600 font-semibold flex items-center gap-1">
                {editing ? <><X size={12} /> Done</> : <><Pencil size={12} /> Edit</>}
              </button>
            </div>
            <div className="space-y-2">
              {p.emergencyContacts.map(c => (
                <div key={c.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"><User size={14} className="text-primary-600" /></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.relation} · {c.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a href={`tel:${c.phone}`} className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"><Phone size={14} className="text-primary-600" /></a>
                    {editing && <button onClick={() => removeContact(c.name)} className="w-8 h-8 rounded-lg bg-danger-100 dark:bg-danger-500/20 flex items-center justify-center"><X size={14} className="text-danger-500" /></button>}
                  </div>
                </div>
              ))}
              {editing && (
                <div className="mt-2 p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input text-sm" placeholder="Name" value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} />
                    <input className="input text-sm" placeholder="Relation" value={newContact.relation} onChange={e => setNewContact({ ...newContact, relation: e.target.value })} />
                  </div>
                  <input className="input text-sm" placeholder="Phone number" value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} />
                  <Button className="w-full" onClick={addContact}><Plus size={14} /> Add Contact</Button>
                </div>
              )}
            </div>
          </Card>
          <Card className="mb-3"><p className="font-bold text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2"><Shield size={16} className="text-success-500" /> Insurance</p><p className="text-sm text-slate-600 dark:text-slate-300">{p.insurance}</p></Card>
        </>
      )}

      <div className="space-y-2 mt-4">
        <Button variant="outline" className="w-full justify-start" onClick={() => navigate('settings')}><Settings size={18} className="mr-2" /> Settings</Button>
        {state.role === 'doctor' && <Button variant="outline" className="w-full justify-start" onClick={() => navigate('admin')}><Stethoscope size={18} className="mr-2" /> Admin Panel</Button>}
        <Button variant="ghost" className="w-full justify-start text-danger-500" onClick={() => { update({ authed: false }); navigate('login'); }}><LogOut size={18} className="mr-2" /> Log Out</Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between py-1.5 text-sm"><span className="text-slate-500">{label}</span><span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span></div>;
}
