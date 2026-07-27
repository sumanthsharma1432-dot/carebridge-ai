import { User, Heart, AlertTriangle, Phone, Shield, ArrowLeft, Settings, LogOut, Stethoscope, Plus, X, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '@/store';
import { useRouter } from '@/router';
import { Card, Chip, PageHeader, Button } from '@/components/ui';
import { useToast } from '@/components/Toast';
import { useTranslation } from 'react-i18next';

export function Profile() {
  const { state, update } = useStore();
  const { navigate, back } = useRouter();
  const { show } = useToast();
  const { t } = useTranslation();
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
    show({ type: 'success', title: t('profile.contact_added'), body: t('profile.contact_will_receive', { name: newContact.name }) });
  };
  const removeContact = (name: string) => {
    const patients = [...state.patients];
    patients[0] = { ...patients[0], emergencyContacts: patients[0].emergencyContacts.filter(c => c.name !== name) };
    update({ patients });
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <button onClick={back} className="mb-3 text-slate-400 flex items-center gap-1 text-sm"><ArrowLeft size={16} /> {t('common.back')}</button>
      <PageHeader title={t('profile.title')} />

      {/* Avatar card */}
      <Card className="mb-4 text-center bg-gradient-to-br from-primary-600 to-primary-800 text-white border-0">
        <img src={isDoctor ? 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg?auto=compress&w=200' : p.avatar} alt="" className="w-20 h-20 rounded-full object-cover mx-auto ring-4 ring-white/30" />
        <p className="font-bold text-lg mt-2">{isDoctor ? 'Dr. Michael Chen' : p.name}</p>
        <p className="text-primary-100 text-xs">{isDoctor ? t('profile.orthopedic_surgeon') : `${p.age} yrs · ${p.gender} · Blood ${p.bloodGroup}`}</p>
        <div className="flex justify-center gap-2 mt-3">
          <span className="chip bg-white/15 text-white">{state.role === 'doctor' ? t('profile.doctor') : t('profile.patient')}</span>
          <span className="chip bg-white/15 text-white">{t('profile.premium')}</span>
        </div>
      </Card>

      {isDoctor ? (
        <>
          <Card className="mb-3"><p className="font-bold text-slate-800 dark:text-white text-sm mb-2">{t('profile.doctor_info')}</p><Row label={t('profile.specialty')} value={t('profile.orthopedic_surgery')} /><Row label={t('profile.license')} value="MD-992311" /><Row label={t('profile.patients')} value={t('profile.active_24')} /><Row label={t('profile.experience')} value={t('profile.years_14')} /></Card>
        </>
      ) : (
        <>
          <Card className="mb-3"><p className="font-bold text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2"><Heart size={16} className="text-danger-500" /> {t('profile.medical_history')}</p>{p.medicalHistory.map(h => <div key={h} className="text-sm text-slate-600 dark:text-slate-300 py-1">{h}</div>)}</Card>
          <Card className="mb-3"><p className="font-bold text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2"><AlertTriangle size={16} className="text-warning-500" /> {t('profile.allergies')}</p><div className="flex flex-wrap gap-2">{p.allergies.map(a => <Chip key={a} color="warning">{a}</Chip>)}</div></Card>
          <Card className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2"><Phone size={16} className="text-primary-500" /> {t('profile.family_emergency')}</p>
              <button onClick={() => setEditing(e => !e)} className="text-xs text-primary-600 font-semibold flex items-center gap-1">
                {editing ? <><X size={12} /> {t('common.done')}</> : <><Pencil size={12} /> {t('common.edit')}</>}
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
                    <input className="input text-sm" placeholder={t('profile.name_placeholder')} value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} />
                    <input className="input text-sm" placeholder={t('profile.relation_placeholder')} value={newContact.relation} onChange={e => setNewContact({ ...newContact, relation: e.target.value })} />
                  </div>
                  <input className="input text-sm" placeholder={t('profile.phone_placeholder')} value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} />
                  <Button className="w-full" onClick={addContact}><Plus size={14} /> {t('profile.add_contact')}</Button>
                </div>
              )}
            </div>
          </Card>
          <Card className="mb-3"><p className="font-bold text-slate-800 dark:text-white text-sm mb-2 flex items-center gap-2"><Shield size={16} className="text-success-500" /> {t('profile.insurance')}</p><p className="text-sm text-slate-600 dark:text-slate-300">{p.insurance}</p></Card>
        </>
      )}

      <div className="space-y-2 mt-4">
        <Button variant="outline" className="w-full justify-start" onClick={() => navigate('settings')}><Settings size={18} className="mr-2" /> {t('profile.settings')}</Button>
        {state.role === 'doctor' && <Button variant="outline" className="w-full justify-start" onClick={() => navigate('admin')}><Stethoscope size={18} className="mr-2" /> {t('profile.admin_panel')}</Button>}
        <Button variant="ghost" className="w-full justify-start text-danger-500" onClick={() => { update({ authed: false }); navigate('login'); }}><LogOut size={18} className="mr-2" /> {t('profile.log_out')}</Button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between py-1.5 text-sm"><span className="text-slate-500">{label}</span><span className="font-semibold text-slate-800 dark:text-slate-200">{value}</span></div>;
}
