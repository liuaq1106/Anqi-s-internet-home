import en from './en.json';
import zh from './zh.json';

export type Locale = 'en' | 'zh';
export type TranslationKey = keyof typeof en;

const dictionaries: Record<Locale, Record<string, string>> = { en, zh };

/**
 * Get the current locale from a URL pathname.
 * Defaults to 'en' if no locale prefix is found.
 */
export function getLocaleFromPath(pathname: string): Locale {
  if (pathname.startsWith('/zh')) return 'zh';
  if (pathname.startsWith('/en')) return 'en';
  return 'en';
}

/**
 * Translate a UI string key into the target locale.
 * Returns the key itself if no translation is found.
 */
export function t(key: TranslationKey | string, locale: Locale): string {
  const dict = dictionaries[locale];
  if (dict && key in dict) {
    return dict[key];
  }
  // Fallback to English
  if (locale !== 'en' && key in dictionaries.en) {
    return dictionaries.en[key];
  }
  return key;
}

/**
 * Resolve a localized value from an object that has en/zh keys.
 * If the value is a string (not localized), return it directly.
 */
export function localized<T extends { en: string; zh: string }>(
  obj: T | string,
  locale: Locale
): string {
  if (typeof obj === 'string') return obj;
  return obj[locale] || obj.en;
}
