import { Languages } from 'lucide-react';
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
export function LanguageSwitcher({
  showLabel = false,
}: {
  showLabel?: boolean;
}) {
  const { language, changeLanguage } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label
        className={
          showLabel
            ? 'flex flex-col items-start gap-2 w-full'
            : 'flex items-center gap-2'
        }
      >
        <span className={showLabel ? 'text-stone-600' : 'sr-only'}>
          Bahasa / Language
        </span>
        <span
          className={`relative inline-flex items-center ${showLabel ? 'w-full' : ''}`}
        >
          <Languages
            size={17}
            aria-hidden="true"
            className="absolute left-3 pointer-events-none text-stone-500"
          />
          <select
            className={`border border-stone-200 bg-white rounded-lg pl-9 pr-2 py-2 min-h-11 text-sm text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:opacity-60 ${showLabel ? 'w-full' : ''}`}
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
        </span>
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
