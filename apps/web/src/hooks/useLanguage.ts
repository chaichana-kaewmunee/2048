import { useCallback, useEffect, useState } from 'react';
import type { Language } from '../i18n/messages';

const STORAGE_KEY = 'neon-fusion-language';

function initialLanguage(): Language {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'th' ? 'th' : 'en';
  } catch {
    return 'en';
  }
}

export function useLanguage(): { language: Language; setLanguage: (language: Language) => void } {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    document.documentElement.lang = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Language still works for the current session when storage is blocked.
    }
  }, []);

  return { language, setLanguage };
}
