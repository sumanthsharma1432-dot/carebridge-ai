import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en/translation.json';
import es from '@/locales/es/translation.json';
import hi from '@/locales/hi/translation.json';
import fr from '@/locales/fr/translation.json';
import ar from '@/locales/ar/translation.json';
import de from '@/locales/de/translation.json';
import ja from '@/locales/ja/translation.json';
import zh from '@/locales/zh/translation.json';
import pt from '@/locales/pt/translation.json';
import bn from '@/locales/bn/translation.json';
import ru from '@/locales/ru/translation.json';
import ur from '@/locales/ur/translation.json';

export interface LangInfo {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
  rtl: boolean;
  speechLang: string;
}

export const LANGUAGES: LangInfo[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸', rtl: false, speechLang: 'en-US' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳', rtl: false, speechLang: 'hi-IN' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸', rtl: false, speechLang: 'es-ES' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷', rtl: false, speechLang: 'fr-FR' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪', rtl: false, speechLang: 'de-DE' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', flag: '🇯🇵', rtl: false, speechLang: 'ja-JP' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文', flag: '🇨🇳', rtl: false, speechLang: 'zh-CN' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: '🇸🇦', rtl: true, speechLang: 'ar-SA' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', flag: '🇧🇷', rtl: false, speechLang: 'pt-BR' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', flag: '🇧🇩', rtl: false, speechLang: 'bn-IN' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', flag: '🇷🇺', rtl: false, speechLang: 'ru-RU' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', flag: '🇵🇰', rtl: true, speechLang: 'ur-PK' },
];

export const RTL_LANGUAGES = ['ar', 'ur', 'he', 'fa'];

export function isRTL(code: string): boolean {
  return RTL_LANGUAGES.includes(code);
}

export function getSpeechLang(code: string): string {
  return LANGUAGES.find(l => l.code === code)?.speechLang || 'en-US';
}

export function getLangInfo(code: string): LangInfo {
  return LANGUAGES.find(l => l.code === code) || LANGUAGES[0];
}

const savedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('carebridge_lang') || 'en' : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    hi: { translation: hi },
    fr: { translation: fr },
    ar: { translation: ar },
    de: { translation: de },
    ja: { translation: ja },
    zh: { translation: zh },
    pt: { translation: pt },
    bn: { translation: bn },
    ru: { translation: ru },
    ur: { translation: ur },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function setLanguage(code: string) {
  i18n.changeLanguage(code);
  try { localStorage.setItem('carebridge_lang', code); } catch {}
  document.documentElement.lang = code;
  document.documentElement.dir = isRTL(code) ? 'rtl' : 'ltr';
}

if (typeof document !== 'undefined') {
  document.documentElement.lang = savedLang;
  document.documentElement.dir = isRTL(savedLang) ? 'rtl' : 'ltr';
}

export default i18n;
