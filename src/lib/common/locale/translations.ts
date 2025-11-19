import translation from '@/lib/common/locale/translations.json';
import localeDisplayNames from '@/lib/common/locale/locale-display-names.json';

/**
 * Type guard to ensure the key exists in the translations JSON.
 */
const isLocaleKey = (k: string): k is keyof typeof translation => {
  return Object.prototype.hasOwnProperty.call(translation, k);
};

export const getTranslation = (
  code: string
): Record<string, string | boolean> => {
  /**
   * If the requested code doesn't exist, fall back to "en".
   * This covers invalid locale codes.
   */
  if (!isLocaleKey(code)) {
    return translation['en'] as Record<string, string | boolean>;
  }

  /**
   * Start with the value associated with the requested locale.
   * It may be either a translation object or an alias string.
   */
  let value = translation[code];

  /**
   * Track visited aliases to detect loops (e.g. a → b → a).
   */
  const seen = new Set<string>();

  /**
   * Follow alias chains as long as the value is a string.
   * Stop when it becomes an object (actual translations).
   */
  while (typeof value === 'string') {
    /**
     * If alias loops back (self-alias or cycle) or points to
     * something that doesn't exist, return "en" as fallback.
     */
    if (seen.has(value) || !isLocaleKey(value)) {
      value = translation['en'];
      break;
    }

    /**
     * Mark this alias as visited.
     */
    seen.add(value);

    /**
     * Move to next alias target.
     */
    value = translation[value];
  }

  /**
   * At this point, "value" is a translation object.
   */
  return value as Record<string, string | boolean>;
};
/**
 * @returns string array of available locale codes
 */
export const getAvailableLocales = (): string[] => {
  return Object.keys(translation).filter((key) => {
    const value = translation[key as keyof typeof translation];
    return typeof value === 'object';
  });
};

export const getLocaleDisplayName = (locale: string): string => {
  return (localeDisplayNames as Record<string, string>)[locale] || 'English';
};
