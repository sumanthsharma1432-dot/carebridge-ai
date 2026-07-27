import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import type { AppState } from './types';
import { initialState } from './data/mock';
import { setLanguage, getLangInfo, LANGUAGES } from './i18n';

const KEY = 'carebridge_state_v1';

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    const base = raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
    const savedLang = localStorage.getItem('carebridge_lang');
    if (savedLang) base.language = getLangInfo(savedLang).label;
    // Hydrate voice settings from dedicated keys
    const vname = localStorage.getItem('carebridge_voice_name');
    const pitch = localStorage.getItem('carebridge_voice_pitch');
    const rate = localStorage.getItem('carebridge_voice_rate');
    const wakeword = localStorage.getItem('carebridge_custom_wakeword');
    base.voice = {
      ...initialState.voice,
      ...base.voice,
      ...(vname !== null ? { voiceName: vname } : {}),
      ...(pitch !== null ? { pitch: Number(pitch) } : {}),
      ...(rate !== null ? { rate: Number(rate) } : {}),
      ...(wakeword !== null ? { wakeWord: wakeword } : {}),
    };
    return base;
  } catch {}
  return initialState;
}

interface Ctx {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  update: (patch: Partial<AppState>) => void;
  reset: () => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
    try {
      if (state.voice.voiceName) localStorage.setItem('carebridge_voice_name', state.voice.voiceName);
      localStorage.setItem('carebridge_voice_pitch', String(state.voice.pitch));
      localStorage.setItem('carebridge_voice_rate', String(state.voice.rate));
      localStorage.setItem('carebridge_custom_wakeword', state.voice.wakeWord);
    } catch {}
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  useEffect(() => {
    const langInfo = LANGUAGES.find(l => l.label === state.language);
    if (langInfo) setLanguage(langInfo.code);
  }, [state.language]);

  const update = useCallback((patch: Partial<AppState>) => setState(s => ({ ...s, ...patch })), []);
  const reset = useCallback(() => setState(initialState), []);

  return <StoreCtx.Provider value={{ state, setState, update, reset }}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
