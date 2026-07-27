import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Mail, Lock, User, ArrowLeft, ShieldCheck, CheckCircle2, Mic, Volume2, Loader2 } from 'lucide-react';
import { useRouter } from '@/router';
import { useStore } from '@/store';
import { Button } from '@/components/ui';
import { useVoiceEngine } from '@/components/useVoiceEngine';
import { useToast } from '@/components/Toast';
import { useTranslation } from 'react-i18next';

export function Login() {
  const { navigate, back } = useRouter();
  const { state, update } = useStore();
  const { speak, recognize, recSupported, speechSupported } = useVoiceEngine();
  const { show } = useToast();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [role, setRole] = useState<'patient' | 'doctor'>(state.role);
  const [email, setEmail] = useState(role === 'patient' ? 'sarah@carebridge.app' : 'drchen@carebridge.app');
  const [password, setPassword] = useState('demo1234');
  const [verify, setVerify] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);

  const submit = () => {
    if (mode === 'forgot') { setVerify(true); return; }
    update({ role, authed: true });
    navigate(role === 'patient' ? 'patient-home' : 'doctor-home');
  };

  const voiceSignIn = () => {
    if (!recSupported) { show({ type: 'info', title: t('login.voice_signin_unavailable'), body: t('login.browser_no_speech') }); return; }
    setVoiceActive(true);
    const ok = recognize((text) => {
      const lower = text.toLowerCase();
      let parsedRole: 'patient' | 'doctor' = 'patient';
      let name = 'Sarah';
      if (lower.includes('doctor') || lower.includes('dr')) { parsedRole = 'doctor'; name = 'Dr. Smith'; }
      else if (lower.includes('patient')) { parsedRole = 'patient'; name = 'Sarah'; }
      const nameMatch = text.match(/(?:as|in as|register)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
      if (nameMatch) name = nameMatch[1];
      setVoiceActive(false);
      update({ role: parsedRole, authed: true });
      const greeting = t('login.welcome_back_name', { name });
      show({ type: 'success', title: t('login.voice_signin_success'), body: greeting });
      if (speechSupported) speak(greeting, () => navigate(parsedRole === 'patient' ? 'patient-home' : 'doctor-home'));
      else navigate(parsedRole === 'patient' ? 'patient-home' : 'doctor-home');
    }, () => setVoiceActive(false));
    if (!ok) { setVoiceActive(false); show({ type: 'info', title: t('login.mic_unavailable'), body: t('login.speech_not_supported') }); }
  };

  const voiceSignUp = () => {
    if (!recSupported) { show({ type: 'info', title: t('login.voice_reg_unavailable'), body: t('login.browser_no_speech') }); return; }
    setVoiceActive(true);
    const ok = recognize((text) => {
      const lower = text.toLowerCase();
      let parsedRole: 'patient' | 'doctor' = 'patient';
      let name = 'New User';
      if (lower.includes('doctor') || lower.includes('dr')) { parsedRole = 'doctor'; name = 'Dr. New'; }
      else if (lower.includes('patient')) { parsedRole = 'patient'; name = 'New Patient'; }
      const nameMatch = text.match(/(?:register|sign up|create)\s+(?:patient\s+|doctor\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
      if (nameMatch) name = nameMatch[1];
      setVoiceActive(false);
      update({ role: parsedRole, authed: true });
      const greeting = t('login.account_created', { name });
      show({ type: 'success', title: t('login.voice_reg_success'), body: greeting });
      if (speechSupported) speak(greeting, () => navigate(parsedRole === 'patient' ? 'patient-home' : 'doctor-home'));
      else navigate(parsedRole === 'patient' ? 'patient-home' : 'doctor-home');
    }, () => setVoiceActive(false));
    if (!ok) { setVoiceActive(false); show({ type: 'info', title: t('login.mic_unavailable'), body: t('login.speech_not_supported') }); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-md mx-auto pt-10">
        <button onClick={back} className="mb-6 text-slate-400 flex items-center gap-1 text-sm">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-glow">
            <Heart size={26} className="text-white" fill="white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">{t('app.name')}</h1>
            <p className="text-xs text-slate-500">{t('app.recovery_reimagined')}</p>
          </div>
        </div>

        {/* Role toggle */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
            {(['patient', 'doctor'] as const).map(r => (
              <button key={r} onClick={() => { setRole(r); setEmail(r === 'patient' ? 'sarah@carebridge.app' : 'drchen@carebridge.app'); }}
                className={`py-2.5 rounded-xl text-sm font-semibold capitalize transition ${role === r ? 'bg-white dark:bg-slate-700 shadow text-primary-600 dark:text-primary-300' : 'text-slate-500'}`}>
                {r === 'patient' ? t('login.patient_login') : t('login.doctor_caregiver')}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-1">
              {mode === 'login' ? t('login.welcome_back') : mode === 'register' ? t('login.create_account') : t('login.reset_password')}
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              {mode === 'login' ? t('login.sign_in_to', { role }) : mode === 'register' ? t('login.join_as', { role }) : t('login.send_reset_link')}
            </p>

            {verify ? (
              <div className="glass-card p-6 text-center">
                <CheckCircle2 size={48} className="text-success-500 mx-auto mb-3" />
                <p className="font-semibold text-slate-800 dark:text-white mb-1">{t('login.check_email')}</p>
                <p className="text-sm text-slate-500 mb-4">{t('login.reset_sent', { email })}</p>
                <Button variant="ghost" className="w-full" onClick={() => { setMode('login'); setVerify(false); }}>{t('login.back_to_login')}</Button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-3">
                {mode === 'register' && (
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input className="input pl-11" placeholder={t('login.full_name')} defaultValue={role === 'patient' ? 'Sarah Johnson' : 'Dr. Michael Chen'} />
                  </div>
                )}
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input type="email" className="input pl-11" placeholder={t('login.email')} value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                {mode !== 'forgot' && (
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
                    <input type="password" className="input pl-11" placeholder={t('login.password')} value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary-600 font-medium">{t('login.forgot_password')}</button>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  {mode === 'login' ? t('login.sign_in') : mode === 'register' ? t('login.create_btn') : t('login.send_reset')}
                </Button>

                {mode !== 'forgot' && (
                  <>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                      <span className="text-xs text-slate-400">{t('common.or')}</span>
                      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    </div>

                    {/* Voice authentication buttons */}
                    <div className="space-y-2 mb-3">
                      <button type="button" onClick={mode === 'login' ? voiceSignIn : voiceSignUp}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl py-3 font-semibold text-sm text-white hover:from-primary-700 hover:to-primary-800 transition shadow-glow">
                        {voiceActive ? <Loader2 size={16} className="animate-spin" /> : <Mic size={16} />}
                        {voiceActive ? t('login.listening') : mode === 'login' ? t('login.sign_in_voice') : t('login.register_voice')}
                      </button>
                      <p className="text-center text-[10px] text-slate-400">
                        {mode === 'login' ? t('login.voice_signin_hint') : t('login.voice_signup_hint')}
                      </p>
                    </div>

                    <button type="button" onClick={submit}
                      className="w-full flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl py-3 font-semibold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                      <GoogleIcon /> {t('login.continue_google')}
                    </button>
                  </>
                )}
              </form>
            )}
          </motion.div>
        </AnimatePresence>

        {mode !== 'forgot' && !verify && (
          <div className="flex items-center gap-2 mt-6 p-3 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
            <ShieldCheck size={18} className="text-primary-600 shrink-0" />
            <p className="text-xs text-primary-700 dark:text-primary-300">{t('login.email_verification')}</p>
          </div>
        )}

        {mode !== 'forgot' && (
          <p className="text-center text-sm text-slate-500 mt-6">
            {mode === 'login' ? t('login.no_account') + ' ' : t('login.have_account') + ' '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-primary-600 font-semibold">
              {mode === 'login' ? t('login.sign_up') : t('login.sign_in')}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
