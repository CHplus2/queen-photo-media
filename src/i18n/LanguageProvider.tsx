import React, {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  getLanguage,
  setLanguage,
  subscribeLanguage,
  type Language,
} from './runtime';
const LanguageContext = createContext<{
  language: Language;
  changeLanguage: (language: Language) => Promise<void>;
}>({ language: 'id', changeLanguage: setLanguage });
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguage,
    () => 'id' as Language,
  );
  return (
    <LanguageContext.Provider value={{ language, changeLanguage: setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
export const useLanguage = () => useContext(LanguageContext);
export function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className="qp-container flex justify-end items-center gap-3 py-2 text-xs">
      <label className="flex items-center gap-2">
        <span>Bahasa / Language</span>
        <select
          className="border border-stone-300 bg-white rounded-lg px-2 py-2 min-h-11 text-sm"
          aria-label="Bahasa / Language"
          value={language}
          disabled={busy}
          onChange={async (e) => {
            setBusy(true);
            setFailed(false);
            try {
              await changeLanguage(e.target.value as Language);
            } catch {
              setFailed(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          <option value="id">Bahasa Indonesia</option>
          <option value="en">English</option>
        </select>
      </label>
      {failed && (
        <span role="alert">
          {language === 'id'
            ? 'Bahasa belum dimuat. Coba lagi.'
            : 'Language could not be loaded. Try again.'}
        </span>
      )}
    </div>
  );
}
