import { useState, useEffect } from 'react';
import { Moon, Bell, Globe, LogOut, ArrowLeft, ChevronRight, Shield, HelpCircle, Mic, Volume2, AudioLines, Ear, Radio, Check, X } from 'lucide-react';
import { useStore } from '@/store';
import { useRouter } from '@/router';
import { Card, PageHeader, Button } from '@/components/ui';
import { useVoiceEngine } from '@/components/useVoiceEngine';
import { useToast } from '@/components/Toast';
import { useTranslation } from 'react-i18next';
import { LanguageManager } from '@/components/LanguageManager';

const WAKE_PRESETS = ['Hey CareBridge', 'Hey Care', 'Hey Bridge', 'Hey Doctor'];

export function Settings() {
  const { state, update } = useStore();
  const { back, navigate } = useRouter();
  const { voices, speechSupported, recSupported, speak, recognize, updateVoice } = useVoiceEngine();
  const { show } = useToast();
  const { t } = useTranslation();
  const [showLangManager, setShowLangManager] = useState(false);

  const [testingWake, setTestingWake] = useState(false);
  const [wakeResult, setWakeResult] = useState<'none' | 'success' | 'fail'>('none');

  const langCode = { English: 'en', Spanish: 'es', French: 'fr', German: 'de', Hindi: 'hi' }[state.language] || 'en';
  const filteredVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langCode));

  const testVoice = () => {
    if (!speechSupported) { show({ type: 'info', title: t('settings.voice_unavailable'), body: t('settings.browser_no_synthesis') }); return; }
    speak(t('settings.test_phrase_spoken'));
  };

  const testWake = () => {
    if (!recSupported) { show({ type: 'info', title: t('settings.mic_unavailable'), body: t('settings.rec_not_supported') }); return; }
    setTestingWake(true);
    setWakeResult('none');
    const ok = recognize((text) => {
      const heard = text.toLowerCase().trim();
      const target = state.voice.wakeWord.toLowerCase().trim();
      if (heard.includes(target) || target.includes(heard)) {
        setWakeResult('success');
        show({ type: 'success', title: t('settings.trigger_recognized'), body: t('settings.heard', { text }) });
      } else {
        setWakeResult('fail');
        show({ type: 'error', title: t('settings.try_again'), body: t('settings.heard', { text }) });
      }
      setTestingWake(false);
    }, () => setTestingWake(false));
    if (!ok) { setTestingWake(false); show({ type: 'info', title: t('settings.mic_unavailable'), body: t('settings.speech_not_supported') }); }
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <button onClick={back} className="mb-3 text-slate-400 flex items-center gap-1 text-sm"><ArrowLeft size={16} /> {t('common.back')}</button>
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <Card className="mb-3">
        <Toggle icon={Moon} label={t('settings.dark_mode')} value={state.darkMode} onChange={v => update({ darkMode: v })} />
        <div className="border-t border-slate-100 dark:border-slate-700 my-2" />
        <Toggle icon={Bell} label={t('settings.notifications')} value={state.notifications} onChange={v => update({ notifications: v })} />
      </Card>

      <Card className="mb-3">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3"><Globe size={18} className="text-slate-500" /><span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('settings.language')}</span></div>
          <button onClick={() => setShowLangManager(true)} className="text-sm bg-transparent text-slate-600 dark:text-slate-300 outline-none flex items-center gap-1">
            {state.language} <ChevronRight size={14} className="text-slate-400" />
          </button>
        </div>
      </Card>

      {/* Voice & Persona Selection */}
      <Card className="mb-3">
        <p className="font-bold text-slate-800 dark:text-white text-sm mb-3 flex items-center gap-2"><AudioLines size={16} className="text-primary-600" /> {t('settings.voice_persona')}</p>

        {!speechSupported && <p className="text-xs text-danger-500 mb-2">{t('settings.speech_not_supported')}</p>}

        <label className="text-xs text-slate-500 mb-1 block">{t('settings.voice')}</label>
        <select
          value={state.voice.voiceName}
          onChange={e => updateVoice({ voiceName: e.target.value })}
          disabled={!speechSupported}
          className="w-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 mb-3 outline-none border border-slate-200 dark:border-slate-700 disabled:opacity-50"
        >
          <option value="">{t('settings.default_auto')}</option>
          {filteredVoices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
          {filteredVoices.length === 0 && voices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
        </select>

        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <label className="text-xs text-slate-500">{t('settings.speech_pitch')}</label>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{state.voice.pitch.toFixed(2)}</span>
          </div>
          <input type="range" min={0.5} max={1.5} step={0.05} value={state.voice.pitch} onChange={e => updateVoice({ pitch: +e.target.value })} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ accentColor: '#0ea5e9' }} />
        </div>

        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <label className="text-xs text-slate-500">{t('settings.speech_rate')}</label>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{state.voice.rate.toFixed(2)}x</span>
          </div>
          <input type="range" min={0.8} max={1.5} step={0.05} value={state.voice.rate} onChange={e => updateVoice({ rate: +e.target.value })} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ accentColor: '#0ea5e9' }} />
        </div>

        <Button variant="ghost" className="w-full" onClick={testVoice} disabled={!speechSupported}>
          <Volume2 size={16} /> {t('settings.test_voice')}
        </Button>
      </Card>

      {/* Custom Wake Word */}
      <Card className="mb-3">
        <p className="font-bold text-slate-800 dark:text-white text-sm mb-3 flex items-center gap-2"><Radio size={16} className="text-primary-600" /> Custom Wake Word</p>

        {!recSupported && <p className="text-xs text-danger-500 mb-2">Speech recognition is not supported in this browser.</p>}

        <label className="text-xs text-slate-500 mb-1 block">Trigger Phrase</label>
        <input
          value={state.voice.wakeWord}
          onChange={e => updateVoice({ wakeWord: e.target.value })}
          placeholder="Type a custom wake word..."
          className="w-full text-sm bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl px-3 py-2 mb-2 outline-none border border-slate-200 dark:border-slate-700"
        />
        <div className="flex gap-2 mb-3 flex-wrap">
          {WAKE_PRESETS.map(w => (
            <button key={w} onClick={() => updateVoice({ wakeWord: w })}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${state.voice.wakeWord === w ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {w}
            </button>
          ))}
        </div>

        <Button variant="ghost" className="w-full mb-2" onClick={testWake} disabled={!recSupported || testingWake}>
          <Mic size={16} /> {testingWake ? t('login.listening') : t('settings.test_phrase')}
        </Button>

        {wakeResult === 'success' && (
          <div className="flex items-center gap-2 text-xs font-semibold text-success-600 bg-success-50 dark:bg-success-700/20 rounded-lg px-3 py-2">
            <Check size={14} /> {t('settings.trigger_recognized')}
          </div>
        )}
        {wakeResult === 'fail' && (
          <div className="flex items-center gap-2 text-xs font-semibold text-danger-500 bg-danger-50 dark:bg-danger-700/20 rounded-lg px-3 py-2">
            <X size={14} /> {t('settings.try_again')}
          </div>
        )}
      </Card>

      {/* Hands-Free Mode */}
      <Card className="mb-3">
        <Toggle icon={Ear} label={t('settings.hands_free')} value={state.voice.handsFree} onChange={v => {
          updateVoice({ handsFree: v });
          show({ type: v ? 'success' : 'info', title: v ? t('settings.hands_free_enabled') : t('settings.hands_free_disabled'), body: v ? t('settings.say_wake_activate', { wakeWord: state.voice.wakeWord }) : t('settings.background_off') });
        }} />
        {!recSupported && state.voice.handsFree && <p className="text-xs text-danger-500 mt-2">{t('settings.hands_free_required')}</p>}
      </Card>

      <Card className="mb-3">
        <SettingRow icon={Shield} label={t('settings.privacy_security')} onClick={() => {}} />
        <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
        <SettingRow icon={HelpCircle} label={t('settings.help_support')} onClick={() => {}} />
      </Card>

      <button onClick={() => { update({ authed: false }); navigate('login'); }} className="w-full glass-card flex items-center gap-3 p-4 text-danger-500 font-semibold text-sm">
        <LogOut size={18} /> {t('settings.log_out')}
      </button>

      <p className="text-center text-xs text-slate-400 mt-6">{t('app.version')}</p>

      <LanguageManager open={showLangManager} onClose={() => setShowLangManager(false)} />
    </div>
  );
}

function Toggle({ icon: Icon, label, value, onChange }: { icon: typeof Moon; label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3"><Icon size={18} className="text-slate-500" /><span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span></div>
      <button onClick={() => onChange(!value)} className={`w-12 h-7 rounded-full transition relative ${value ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
        <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${value ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function SettingRow({ icon: Icon, label, onClick }: { icon: typeof Shield; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between py-2">
      <div className="flex items-center gap-3"><Icon size={18} className="text-slate-500" /><span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span></div>
      <ChevronRight size={18} className="text-slate-400" />
    </button>
  );
}
