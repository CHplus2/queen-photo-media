export type Language = 'id' | 'en';
let language: Language = 'id';
let english: Record<string, string> = {};
let loaded = false;
const listeners = new Set<() => void>();
let patterns: { regex: RegExp; translated: string; positions: string[] }[] = [];
export const getLanguage = () => language;
export const getLocale = () => (language === 'en' ? 'en-GB' : 'id-ID');
export function subscribeLanguage(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export async function setLanguage(next: Language) {
  if (next !== 'id' && next !== 'en') return;
  if (next === 'en' && !loaded) {
    english = (await import('./en')).default;
    patterns = Object.entries(english)
      .filter(([key]) => /\{\d+\}/.test(key))
      .map(([key, translated]) => {
        const positions: string[] = [];
        let cursor = 0;
        let pattern = '';
        for (const match of key.matchAll(/\{(\d+)\}/g)) {
          pattern +=
            key
              .slice(cursor, match.index)
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([\\s\\S]*?)';
          positions.push(match[1]);
          cursor = match.index! + match[0].length;
        }
        pattern += key.slice(cursor).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return {
          regex: new RegExp('^' + pattern + '$'),
          translated,
          positions,
          specificity: key.replace(/\{\d+\}/g, '').length,
        };
      })
      .sort((a, b) => b.specificity - a.specificity);
    loaded = true;
  }
  language = next;
  if (typeof document !== 'undefined') document.documentElement.lang = next;
  try {
    localStorage.setItem('queen_language', next);
  } catch {
    /* Preference storage is optional. */
  }
  listeners.forEach((listener) => listener());
}
export async function initializeLanguage() {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem('queen_language');
  } catch {}
  try {
    await setLanguage(saved === 'en' ? 'en' : 'id');
  } catch {
    await setLanguage('id');
  }
}
// Only explicitly marked application text is translated. Stored names, IDs,
// free-text notes and input values remain unchanged.
export function tr(text: string): string {
  if (language === 'id' || typeof text !== 'string') return text;
  if (Object.hasOwn(english, text)) return english[text];
  for (const { regex, translated, positions } of patterns) {
    const match = regex.exec(text);
    if (match) {
      const values: Record<string, string> = {};
      positions.forEach((key, i) => {
        values[key] = match[i + 1];
      });
      return translated.replace(
        /\{(\d+)\}/g,
        (_, key) => values[key] ?? '{' + key + '}',
      );
    }
  }
  return text;
}
