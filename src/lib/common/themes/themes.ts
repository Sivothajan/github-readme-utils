import themes from '@/lib/common/themes/themes.json';

/**
 * Type guard to ensure the key exists in the themes JSON.
 */
const isthemeKey = (k: string): k is keyof typeof themes => {
  return Object.prototype.hasOwnProperty.call(themes, k);
};

export const getTheme = (code: string): Record<string, string> => {
  /**
   * If the requested code doesn't exist, fall back to "default".
   * This covers invalid themes codes.
   */
  if (!isthemeKey(code)) {
    return themes['default'] as Record<string, string>;
  }

  /**
   * Start with the value associated with the requested themes.
   * It may be either a theme object or an alias string.
   */
  let value = themes[code];

  /**
   * Track visited aliases to detect loops (e.g. a → b → a).
   */
  const seen = new Set<string>();

  /**
   * Follow alias chains as long as the value is a string.
   * Stop when it becomes an object (actual themes).
   */
  while (typeof value === 'string') {
    /**
     * If alias loops back (self-alias or cycle) or points to
     * something that doesn't exist, return "default" as fallback.
     */
    if (seen.has(value) || !isthemeKey(value)) {
      value = themes['default'];
      break;
    }

    /**
     * Mark this alias as visited.
     */
    seen.add(value);

    /**
     * Move to next alias target.
     */
    value = themes[value];
  }

  /**
   * At this point, "value" is a theme object.
   */
  return value as Record<string, string>;
};

export const getAllThemeNames = (): string[] => {
  return Object.keys(themes).filter((key) => {
    return typeof themes[key as keyof typeof themes] !== 'string';
  });
};
