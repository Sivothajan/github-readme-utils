import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAvailableLocales } from '@/lib/common/locale/translations';

// ANSI codes
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

// Get locales
const availableLocales: string[] = getAvailableLocales(); // filtered for object values

// Filter locales that are valid for Intl.DisplayNames
const supported: string[] = availableLocales.filter((locale) => {
  try {
    // Intl.DisplayNames will throw if the locale is invalid
    new Intl.DisplayNames(['en'], { type: 'language' }).of(locale);
    return true;
  } catch {
    console.warn(`Skipping invalid locale: ${locale}`);
    return false;
  }
});

// Build array of [locale, name]
const rows: [string, string][] = supported.map((locale) => {
  const name: string =
    new Intl.DisplayNames(['en'], { type: 'language' }).of(locale) || locale;
  return [locale, name];
});

// Find max widths for console table
const maxLocaleLength: number = Math.max(
  ...rows.map((r) => r[0].length),
  'Locale code'.length
);
const maxNameLength: number = Math.max(
  ...rows.map((r) => r[1].length),
  'Language Name'.length
);

// Helper to pad strings
const pad = (str: string, length: number): string =>
  str + ' '.repeat(length - str.length);

// Print header
console.log(
  `${BOLD}${GREEN}| ${pad('Locale code', maxLocaleLength)} | ${pad('Language Name', maxNameLength)} |${RESET}`
);
console.log(
  `${GREEN}|-${'-'.repeat(maxLocaleLength)}-|-${'-'.repeat(maxNameLength)}-|${RESET}`
);

// Print rows with colors
rows.forEach(([locale, name]) => {
  console.log(
    `| ${CYAN}${pad(locale, maxLocaleLength)}${RESET} | ${YELLOW}${pad(name, maxNameLength)}${RESET} |`
  );
});

// Save JSON
const localeObject: Record<string, string> = Object.fromEntries(rows);

// Resolve path relative to project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.resolve(
  __dirname,
  '../src/lib/common/locale/locale-display-names.json'
);

writeFileSync(outputPath, JSON.stringify(localeObject, null, 2), 'utf8');
console.log(`${BOLD}${GREEN}\nJSON file created: ${outputPath}${RESET}`);
