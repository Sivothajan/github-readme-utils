import { getTranslation } from '@/lib/common/locale/translations';
import { getTheme } from '@/lib/common/themes/themes';
import { getAllColors } from '@/lib/common/colors/colors';
import { GitHubContributionStatsResult } from '@/lib/api/github/github.d';
import type {
  CardStats,
  CardRequestParams,
  ConvertedColor,
  LocaleTranslations,
  TokenFormatter,
} from '@/lib/common/card/card.d';

const cssColors = new Set(getAllColors().map((color) => color.toLowerCase()));
const WEEKDAY_ABBREVIATIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_REFERENCE_DATES = WEEKDAY_ABBREVIATIONS.map(
  (_, index) => new Date(Date.UTC(2023, 0, 1 + index))
);
const OPTIONAL_SECTION_PATTERNS = [/\[[^\]]*]/g, /\{[^}]*}/g];
const OPTIONAL_SECTION_CHARS = /[\[\]\{\}]/g;
const HEX_COLOR_PATTERN =
  /^([a-f0-9]{3}|[a-f0-9]{4}|[a-f0-9]{6}|[a-f0-9]{8})$/i;
const BACKGROUND_GRADIENT_PATTERN =
  /^-?\d+,(?:[a-f0-9]{3,8})(?:,[a-f0-9]{3,8})+$/i;
const OPTIONAL_NEWLINE_REGEX = /^(.*)\n([\s\S]*)$/;
const STYLE_TAG_REGEX = /(<style>[\s\S]*?<\/style>)/g;
const TRANSPARENT_ATTRIBUTE_REGEX = /(fill|stroke)=['"]transparent['"]/gi;
const HEX_COLOR_ATTRIBUTE_REGEX =
  /\b(fill|stroke|stop-color|flood-color|lighting-color)\s*=\s*["']#?([0-9a-fA-F]{3,8})["']/g;

const HTML_ESCAPE_LOOKUP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
};

const TOKEN_MAP: Record<string, TokenFormatter> = {
  Y: (date) => date.getUTCFullYear().toString(),
  y: (date) => date.getUTCFullYear().toString().slice(-2),
  m: (date) => String(date.getUTCMonth() + 1).padStart(2, '0'),
  n: (date) => String(date.getUTCMonth() + 1),
  d: (date) => String(date.getUTCDate()).padStart(2, '0'),
  j: (date) => String(date.getUTCDate()),
  M: (date, locale) =>
    new Intl.DateTimeFormat(locale, {
      month: 'short',
      timeZone: 'UTC',
    }).format(date),
  F: (date, locale) =>
    new Intl.DateTimeFormat(locale, {
      month: 'long',
      timeZone: 'UTC',
    }).format(date),
};

const coerceParamValue = (value?: string | string[]): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return typeof value === 'string' ? value : undefined;
};

export const getParamValue = (
  params: CardRequestParams,
  key: string
): string | undefined => {
  return coerceParamValue(params[key]);
};

export const isParamTrue = (value?: string): boolean => {
  return value?.toLowerCase() === 'true';
};

const escapeHtml = (value: string): string => {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPE_LOOKUP[char]);
};

const sanitizeOptionalSections = (
  format: string,
  includeOptional: boolean
): string => {
  if (!includeOptional) {
    return OPTIONAL_SECTION_PATTERNS.reduce(
      (acc, pattern) => acc.replace(pattern, ''),
      format
    );
  }
  return format.replace(OPTIONAL_SECTION_CHARS, '');
};

const formatWithCustomPattern = (
  date: Date,
  pattern: string,
  locale: string
): string => {
  let escapeNext = false;
  let result = '';
  for (const char of pattern) {
    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    const formatter = TOKEN_MAP[char];
    result += formatter ? formatter(date, locale) : char;
  }
  if (escapeNext) {
    result += '\\';
  }
  return result;
};

const toUtcDate = (dateString: string): Date => {
  return new Date(`${dateString}T00:00:00Z`);
};

const getNumberParam = (
  params: CardRequestParams,
  key: string,
  fallback: number
): number => {
  const raw = getParamValue(params, key);
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getStringTranslation = (
  translationsMap: LocaleTranslations,
  key: string,
  fallback = ''
): string => {
  const value = translationsMap[key];
  return typeof value === 'string' ? value : fallback;
};

/**
 * Convert date from Y-M-D to more human-readable format.
 */
function formatDate(
  dateString: string,
  format: string | null | undefined,
  locale: string
): string {
  const date = toUtcDate(dateString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const currentYear = new Date().getUTCFullYear();
  const includeOptional = date.getUTCFullYear() !== currentYear;
  if (format) {
    const processedPattern = sanitizeOptionalSections(format, includeOptional);
    return escapeHtml(formatWithCustomPattern(date, processedPattern, locale));
  }
  const options: Intl.DateTimeFormatOptions = includeOptional
    ? { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }
    : { month: 'short', day: 'numeric', timeZone: 'UTC' };
  return escapeHtml(new Intl.DateTimeFormat(locale, options).format(date));
}

/**
 * Translate days of the week to match the locale.
 */
function translateDays(days: string[], locale: string): string[] {
  if (locale === 'en') {
    return days;
  }
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    timeZone: 'UTC',
  });
  return days.map((day) => {
    const index = WEEKDAY_ABBREVIATIONS.findIndex(
      (abbr) => abbr.toLowerCase() === day.toLowerCase()
    );
    if (index === -1) {
      return day;
    }
    return formatter.format(WEEKDAY_REFERENCE_DATES[index]);
  });
}

/**
 * Get the excluding days text for the locale.
 */
function getExcludingDaysText(
  excludedDays: string[],
  localeTranslations: LocaleTranslations,
  localeCode: string
): string {
  const separator =
    getStringTranslation(localeTranslations, 'comma_separator') || ', ';
  const translated = translateDays(excludedDays, localeCode).join(separator);
  const template = getStringTranslation(localeTranslations, 'Excluding {days}');
  return escapeHtml(template.replace('{days}', translated));
}

/** Normalize a theme name. */
function normalizeThemeName(theme: string): string {
  return theme.toLowerCase().replace(/_/g, '-');
}

/**
 * Check theme and color customization parameters to generate a theme mapping.
 */
function getRequestedTheme(params: CardRequestParams): Record<string, string> {
  const selectedTheme = normalizeThemeName(
    getParamValue(params, 'theme') ?? 'default'
  );
  const theme = { ...getTheme(selectedTheme) } as Record<string, string>;
  Object.keys(theme).forEach((prop) => {
    const rawValue = coerceParamValue(params[prop]);
    if (!rawValue) {
      return;
    }
    const normalized = rawValue.toLowerCase();
    if (HEX_COLOR_PATTERN.test(normalized)) {
      theme[prop] = `#${normalized}`;
      return;
    }
    if (cssColors.has(normalized)) {
      theme[prop] = normalized;
      return;
    }
    if (prop === 'background' && BACKGROUND_GRADIENT_PATTERN.test(normalized)) {
      theme[prop] = normalized;
    }
  });
  if (isParamTrue(getParamValue(params, 'hide_border'))) {
    theme.border = '#0000';
  }
  let gradient = '';
  const backgroundParts = theme.background?.split(',') ?? [];
  if (backgroundParts.length >= 3) {
    const angle = backgroundParts[0];
    const colors = backgroundParts.slice(1);
    const count = colors.length;
    const stops = colors
      .map((color, index) => {
        const offset = count === 1 ? 0 : (index * 100) / (count - 1);
        // FIX: Use Double Quotes for offset to ensure sanitizeSvg regex matches it
        return `<stop offset="${offset}%" stop-color="#${color}" />`;
      })
      .join('');
    // FIX: Use Double Quotes
    gradient = `<linearGradient id="gradient" gradientTransform="rotate(${angle})" gradientUnits="userSpaceOnUse">${stops}</linearGradient>`;
    theme.background = 'url(#gradient)';
  }
  theme.backgroundGradient = gradient;
  return theme;
}

const utf8WordWrap = (
  text: string,
  width = 75,
  breakStr = '\n',
  cutLongWords = false
): string => {
  if (width <= 0) {
    return text;
  }
  const wrapRegex = new RegExp(`(.{1,${width}})(?:\\s|$)`, 'gus');
  let wrapped = text.replace(
    wrapRegex,
    (_, chunk: string) => `${chunk}${breakStr}`
  );
  if (cutLongWords) {
    const longWordRegex = new RegExp(`(\\S{${width}})(?=\\S)`, 'gu');
    wrapped = wrapped.replace(longWordRegex, `$1${breakStr}`);
  }
  return wrapped.endsWith(breakStr)
    ? wrapped.slice(0, -breakStr.length)
    : wrapped;
};

const utf8Strlen = (text: string): number => {
  return Array.from(text).length;
};

/**
 * Split lines of text using <tspan> elements.
 */
function splitLines(
  text: string,
  maxChars: number,
  line1Offset: number
): string {
  let processed = text;
  if (
    maxChars > 0 &&
    utf8Strlen(processed) > maxChars &&
    !processed.includes('\n')
  ) {
    processed = processed.includes(' - ')
      ? processed.replace(' - ', '\n- ')
      : utf8WordWrap(processed, maxChars, '\n', true);
  }
  const escaped = escapeHtml(processed);
  // FIX: Use Double Quotes
  return escaped.replace(
    OPTIONAL_NEWLINE_REGEX,
    `<tspan x="0" dy="${line1Offset}">$1</tspan><tspan x="0" dy="16">$2</tspan>`
  );
}

/** Get the card width from params. */
function getCardWidth(params: CardRequestParams, numColumns = 3): number {
  const defaultWidth = 495;
  const minimumWidth = 100 * numColumns;
  const requestedWidth = getNumberParam(params, 'card_width', defaultWidth);
  return Math.max(minimumWidth, requestedWidth);
}

/** Get the card height from params. */
function getCardHeight(params: CardRequestParams): number {
  const defaultHeight = 195;
  const minimumHeight = 170;
  const requestedHeight = getNumberParam(params, 'card_height', defaultHeight);
  return Math.max(minimumHeight, requestedHeight);
}

/** Format numbers using locale-aware formatting. */
function formatNumber(
  num: number,
  localeCode: string,
  useShortNumbers: boolean
): string {
  let value = num;
  let suffix = '';
  if (useShortNumbers) {
    const units = ['', 'K', 'M', 'B', 'T'];
    let unitIndex = 0;
    while (value >= 1000 && unitIndex < units.length - 1) {
      value /= 1000;
      unitIndex += 1;
    }
    value = Math.round(value * 10) / 10;
    suffix = units[unitIndex];
  }
  const formatter = new Intl.NumberFormat(localeCode);
  return `${formatter.format(value)}${suffix}`;
}

const getStreakText = (
  localeTranslations: LocaleTranslations,
  stats: CardStats,
  cardWidth: number,
  numColumns: number
) => {
  const maxChars =
    numColumns > 0 ? Math.floor(cardWidth / numColumns / 7.5) : 0;
  const totalText = splitLines(
    getStringTranslation(localeTranslations, 'Total Contributions'),
    maxChars,
    -9
  );
  const isWeekly = stats.mode === 'weekly';
  const currentKey = isWeekly ? 'Week Streak' : 'Current Streak';
  const longestKey = isWeekly ? 'Longest Week Streak' : 'Longest Streak';
  const currentText = splitLines(
    getStringTranslation(localeTranslations, currentKey),
    maxChars,
    -9
  );
  const longestText = splitLines(
    getStringTranslation(localeTranslations, longestKey),
    maxChars,
    -9
  );
  return { totalText, currentText, longestText };
};

const getRangeText = (
  text: string,
  cardWidth: number,
  numColumns: number
): string => {
  const maxChars = numColumns > 0 ? Math.floor(cardWidth / numColumns / 6) : 0;
  return splitLines(text, maxChars, 0);
};

const hasExcludedDays = (
  stats: CardStats
): stats is GitHubContributionStatsResult => {
  return stats.mode === 'daily' && Array.isArray(stats.excludedDays);
};

/** Generate SVG output for a stats array. */
export function generateCard(
  stats: CardStats,
  params: CardRequestParams = {}
): string {
  const theme = getRequestedTheme(params);
  const localeCode = getParamValue(params, 'locale') ?? 'en';
  const localeTranslations = getTranslation(localeCode);
  const direction = localeTranslations.rtl ? 'rtl' : 'ltr';
  const dateFormat =
    getParamValue(params, 'date_format') ??
    (typeof localeTranslations.date_format === 'string'
      ? (localeTranslations.date_format as string)
      : undefined);
  const borderRadius = getNumberParam(params, 'border_radius', 4.5);
  const showTotalContributions =
    getParamValue(params, 'hide_total_contributions') !== 'true';
  const showCurrentStreak =
    getParamValue(params, 'hide_current_streak') !== 'true';
  const showLongestStreak =
    getParamValue(params, 'hide_longest_streak') !== 'true';
  const numColumns =
    Number(showTotalContributions) +
    Number(showCurrentStreak) +
    Number(showLongestStreak);
  const cardWidth = getCardWidth(params, numColumns);
  const rectWidth = cardWidth - 1;
  const columnWidth = numColumns > 0 ? cardWidth / numColumns : 0;
  const cardHeight = getCardHeight(params);
  const rectHeight = cardHeight - 1;
  const heightOffset = (cardHeight - 195) / 2;
  const barOffsets = Array(2).fill(-999);
  for (let i = 0; i < numColumns - 1; i += 1) {
    barOffsets[i] = columnWidth * (i + 1);
  }
  let columnOffsets = Array.from(
    { length: numColumns },
    (_, index) => columnWidth / 2 + columnWidth * index
  );
  if (direction === 'rtl') {
    columnOffsets = columnOffsets.reverse();
  }
  let nextColumnIndex = 0;
  const takeColumnOffset = (): number => {
    const value = columnOffsets[nextColumnIndex] ?? -999;
    nextColumnIndex += 1;
    return value;
  };
  const totalContributionsOffset = showTotalContributions
    ? takeColumnOffset()
    : -999;
  const currentStreakOffset = showCurrentStreak ? takeColumnOffset() : -999;
  const longestStreakOffset = showLongestStreak ? takeColumnOffset() : -999;
  const barHeightOffsets = [28 + heightOffset / 2, 170 + heightOffset];
  const totalContributionsHeightOffset = [
    48 + heightOffset,
    84 + heightOffset,
    114 + heightOffset,
  ];
  const currentStreakHeightOffset = [
    48 + heightOffset,
    108 + heightOffset,
    145 + heightOffset,
    71 + heightOffset,
    19.5 + heightOffset,
  ];
  const longestStreakHeightOffset = [...totalContributionsHeightOffset];
  const useShortNumbers = getParamValue(params, 'short_numbers') === 'true';
  const totalContributions = formatNumber(
    stats.totalContributions,
    localeCode,
    useShortNumbers
  );
  const firstContribution = formatDate(
    stats.firstContribution,
    dateFormat,
    localeCode
  );
  const totalContributionsRange = `${firstContribution} - ${getStringTranslation(
    localeTranslations,
    'Present'
  )}`;
  const currentStreakValue = formatNumber(
    stats.currentStreak.length,
    localeCode,
    useShortNumbers
  );
  const currentStreakStart = formatDate(
    stats.currentStreak.start,
    dateFormat,
    localeCode
  );
  const currentStreakEnd = formatDate(
    stats.currentStreak.end,
    dateFormat,
    localeCode
  );
  const currentStreakRange =
    currentStreakStart === currentStreakEnd
      ? currentStreakStart
      : `${currentStreakStart} - ${currentStreakEnd}`;
  const longestStreakValue = formatNumber(
    stats.longestStreak.length,
    localeCode,
    useShortNumbers
  );
  const longestStreakStart = formatDate(
    stats.longestStreak.start,
    dateFormat,
    localeCode
  );
  const longestStreakEnd = formatDate(
    stats.longestStreak.end,
    dateFormat,
    localeCode
  );
  const longestStreakRange =
    longestStreakStart === longestStreakEnd
      ? longestStreakStart
      : `${longestStreakStart} - ${longestStreakEnd}`;
  const { totalText, currentText, longestText } = getStreakText(
    localeTranslations,
    stats,
    cardWidth,
    numColumns
  );
  const totalRangeText = getRangeText(
    totalContributionsRange,
    cardWidth,
    numColumns
  );
  const currentRangeText = getRangeText(
    currentStreakRange,
    cardWidth,
    numColumns
  );
  const longestRangeText = getRangeText(
    longestStreakRange,
    cardWidth,
    numColumns
  );
  const excludedDaysList: string[] = hasExcludedDays(stats)
    ? (stats.excludedDays ?? [])
    : [];
  let excludedDaysText = '';
  if (excludedDaysList.length) {
    const offset = direction === 'rtl' ? cardWidth - 5 : 5;
    const excluding = getExcludingDaysText(
      excludedDaysList,
      localeTranslations,
      localeCode
    );
    // FIX: Use Double Quotes everywhere
    excludedDaysText = `<g style="isolation: isolate">
                <!-- Excluded Days -->
                <g transform="translate(${offset},187)">
                    <text stroke-width="0" text-anchor="right" fill="${
                      theme.excludeDaysLabel
                    }" stroke="none" font-family="Segoe UI, Ubuntu, sans-serif" font-weight="400" font-size="10px" font-style="normal" style="opacity: 0; animation: fadein 0.5s linear forwards 0.9s">
                        * ${excluding}
                    </text>
                </g>
            </g>`;
  }
  // FIX: Use Double Quotes throughout the SVG template
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                style="isolation: isolate" viewBox="0 0 ${cardWidth} ${cardHeight}" width="${cardWidth}px" height="${cardHeight}px" direction="${direction}">
        <style>
            @keyframes currstreak {
                0% { font-size: 3px; opacity: 0.2; }
                80% { font-size: 34px; opacity: 1; }
                100% { font-size: 28px; opacity: 1; }
            }
            @keyframes fadein {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
        </style>
        <defs>
            <clipPath id="outer_rectangle">
                <rect width="${cardWidth}" height="${cardHeight}" rx="${borderRadius}"/>
            </clipPath>
            <mask id="mask_out_ring_behind_fire">
                <rect width="${cardWidth}" height="${cardHeight}" fill="white"/>
                <ellipse id="mask-ellipse" cx="${currentStreakOffset}" cy="32" rx="13" ry="18" fill="black"/>
            </mask>
            ${theme.backgroundGradient}
        </defs>
        <g clip-path="url(#outer_rectangle)">
            <g style="isolation: isolate">
                <rect stroke="${theme.border}" fill="${theme.background}" rx="${borderRadius}" x="0.5" y="0.5" width="${rectWidth}" height="${rectHeight}"/>
            </g>
            <g style="isolation: isolate">
                <line x1="${barOffsets[0]}" y1="${barHeightOffsets[0]}" x2="${barOffsets[0]}" y2="${barHeightOffsets[1]}" vector-effect="non-scaling-stroke" stroke-width="1" stroke="${theme.stroke}" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"/>
                <line x1="${barOffsets[1]}" y1="${barHeightOffsets[0]}" x2="${barOffsets[1]}" y2="${barHeightOffsets[1]}" vector-effect="non-scaling-stroke" stroke-width="1" stroke="${theme.stroke}" stroke-linejoin="miter" stroke-linecap="square" stroke-miterlimit="3"/>
            </g>
            <g style="isolation: isolate">
                <!-- Total Contributions big number -->
                <g transform="translate(${totalContributionsOffset}, ${
                  totalContributionsHeightOffset[0]
                })">
                    <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="${
                      theme.sideNums
                    }" stroke="none" font-family="Segoe UI, Ubuntu, sans-serif" font-weight="700" font-size="28px" font-style="normal" style="opacity: 0; animation: fadein 0.5s linear forwards 0.6s">
                        ${totalContributions}
                    </text>
                </g>

                <!-- Total Contributions label -->
                <g transform="translate(${totalContributionsOffset}, ${
                  totalContributionsHeightOffset[1]
                })">
                    <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="${
                      theme.sideLabels
                    }" stroke="none" font-family="Segoe UI, Ubuntu, sans-serif" font-weight="400" font-size="14px" font-style="normal" style="opacity: 0; animation: fadein 0.5s linear forwards 0.7s">
                        ${totalText}
                    </text>
                </g>

                <!-- Total Contributions range -->
                <g transform="translate(${totalContributionsOffset}, ${
                  totalContributionsHeightOffset[2]
                })">
                    <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="${
                      theme.dates
                    }" stroke="none" font-family="Segoe UI, Ubuntu, sans-serif" font-weight="400" font-size="12px" font-style="normal" style="opacity: 0; animation: fadein 0.5s linear forwards 0.8s">
                        ${totalRangeText}
                    </text>
                </g>
            </g>
            <g style="isolation: isolate">
                <!-- Current Streak big number -->
                <g transform="translate(${currentStreakOffset}, ${
                  currentStreakHeightOffset[0]
                })">
                    <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="${
                      theme.currStreakNum
                    }" stroke="none" font-family="Segoe UI, Ubuntu, sans-serif" font-weight="700" font-size="28px" font-style="normal" style="animation: currstreak 0.6s linear forwards">
                        ${currentStreakValue}
                    </text>
                </g>

                <!-- Current Streak label -->
                <g transform="translate(${currentStreakOffset}, ${
                  currentStreakHeightOffset[1]
                })">
                    <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="${
                      theme.currStreakLabel
                    }" stroke="none" font-family="Segoe UI, Ubuntu, sans-serif" font-weight="700" font-size="14px" font-style="normal" style="opacity: 0; animation: fadein 0.5s linear forwards 0.9s">
                        ${currentText}
                    </text>
                </g>

                <!-- Current Streak range -->
                <g transform="translate(${currentStreakOffset}, ${
                  currentStreakHeightOffset[2]
                })">
                    <text x="0" y="21" stroke-width="0" text-anchor="middle" fill="${
                      theme.dates
                    }" stroke="none" font-family="Segoe UI, Ubuntu, sans-serif" font-weight="400" font-size="12px" font-style="normal" style="opacity: 0; animation: fadein 0.5s linear forwards 0.9s">
                        ${currentRangeText}
                    </text>
                </g>

                <!-- Ring around number -->
                <g mask="url(#mask_out_ring_behind_fire)">
                    <circle cx="${currentStreakOffset}" cy="${
                      currentStreakHeightOffset[3]
                    }" r="40" fill="none" stroke="${
                      theme.ring
                    }" stroke-width="5" style="opacity: 0; animation: fadein 0.5s linear forwards 0.4s"></circle>
                </g>
                <!-- Fire icon -->
                <g transform="translate(${currentStreakOffset}, ${
                  currentStreakHeightOffset[4]
                })" stroke-opacity="0" style="opacity: 0; animation: fadein 0.5s linear forwards 0.6s">
                    <path d="M -12 -0.5 L 15 -0.5 L 15 23.5 L -12 23.5 L -12 -0.5 Z" fill="none"/>
                    <path d="M 1.5 0.67 C 1.5 0.67 2.24 3.32 2.24 5.47 C 2.24 7.53 0.89 9.2 -1.17 9.2 C -3.23 9.2 -4.79 7.53 -4.79 5.47 L -4.76 5.11 C -6.78 7.51 -8 10.62 -8 13.99 C -8 18.41 -4.42 22 0 22 C 4.42 22 8 18.41 8 13.99 C 8 8.6 5.41 3.79 1.5 0.67 Z M -0.29 19 C -2.07 19 -3.51 17.6 -3.51 15.86 C -3.51 14.24 -2.46 13.1 -0.7 12.74 C 1.07 12.38 2.9 11.53 3.92 10.16 C 4.31 11.45 4.51 12.81 4.51 14.2 C 4.51 16.85 2.36 19 -0.29 19 Z" fill="${
                      theme.fire
                    }" stroke-opacity="0"/>
                </g>

            </g>
            <g style="isolation: isolate">
                <!-- Longest Streak big number -->
                <g transform="translate(${longestStreakOffset}, ${
                  longestStreakHeightOffset[0]
                })">
                    <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="${
                      theme.sideNums
                    }" stroke="none" font-family="Segoe UI, Ubuntu, sans-serif" font-weight="700" font-size="28px" font-style="normal" style="opacity: 0; animation: fadein 0.5s linear forwards 1.2s">
                        ${longestStreakValue}
                    </text>
                </g>

                <!-- Longest Streak label -->
                <g transform="translate(${longestStreakOffset}, ${
                  longestStreakHeightOffset[1]
                })">
                    <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="${
                      theme.sideLabels
                    }" stroke="none" font-family="Segoe UI, Ubuntu, sans-serif" font-weight="400" font-size="14px" font-style="normal" style="opacity: 0; animation: fadein 0.5s linear forwards 1.3s">
                        ${longestText}
                    </text>
                </g>

                <!-- Longest Streak range -->
                <g transform="translate(${longestStreakOffset}, ${
                  longestStreakHeightOffset[2]
                })">
                    <text x="0" y="32" stroke-width="0" text-anchor="middle" fill="${
                      theme.dates
                    }" stroke="none" font-family="Segoe UI, Ubuntu, sans-serif" font-weight="400" font-size="12px" font-style="normal" style="opacity: 0; animation: fadein 0.5s linear forwards 1.4s">
                        ${longestRangeText}
                    </text>
                </g>
            </g>
            ${excludedDaysText}
        </g>
    </svg>`;
}

/** Generate SVG displaying an error message. */
export function generateErrorCard(
  message: string,
  params: CardRequestParams = {}
): string {
  const theme = getRequestedTheme(params);
  const borderRadius = getNumberParam(params, 'border_radius', 4.5);
  const cardWidth = getCardWidth(params);
  const rectWidth = cardWidth - 1;
  const centerOffset = cardWidth / 2;
  const cardHeight = getCardHeight(params);
  const rectHeight = cardHeight - 1;
  const heightOffset = (cardHeight - 195) / 2;
  const errorLabelOffset = cardHeight / 2 + 10.5;
  const safeMessage = escapeHtml(message);
  // FIX: Use Double Quotes
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="isolation: isolate" viewBox="0 0 ${cardWidth} ${cardHeight}" width="${cardWidth}px" height="${cardHeight}px">
        <style>
            a {
                fill: ${theme.dates};
            }
        </style>
        <defs>
            <clipPath id="outer_rectangle">
                <rect width="${cardWidth}" height="${cardHeight}" rx="${borderRadius}"/>
            </clipPath>
            ${theme.backgroundGradient}
        </defs>
        <g clip-path="url(#outer_rectangle)">
            <g style="isolation: isolate">
                <rect stroke="${theme.border}" fill="${theme.background}" rx="${borderRadius}" x="0.5" y="0.5" width="${rectWidth}" height="${rectHeight}"/>
            </g>
            <g style="isolation: isolate">
                <!-- Error label -->
                <g transform="translate(${centerOffset}, ${errorLabelOffset})">
                    <text x="0" y="50" dy="0.25em" stroke-width="0" text-anchor="middle" fill="${
                      theme.sideLabels
                    }" stroke="none" font-family="Segoe UI, Ubuntu, sans-serif" font-weight="400" font-size="14px" font-style="normal">
                        ${safeMessage}
                    </text>
                </g>

                <!-- Mask for background behind face -->
                <defs>
                    <mask id="cut-off-area">
                        <rect x="0" y="0" width="500" height="500" fill="white" />
                        <ellipse cx="${centerOffset}" cy="31" rx="13" ry="18"/>
                    </mask>
                </defs>
                <!-- Sad face -->
                <g transform="translate(${centerOffset}, ${heightOffset})">
                    <path fill="${theme.fire}" d="M0,35.8c-25.2,0-45.7,20.5-45.7,45.7s20.5,45.8,45.7,45.8s45.7-20.5,45.7-45.7S25.2,35.8,0,35.8z M0,122.3c-11.2,0-21.4-4.5-28.8-11.9c-2.9-2.9-5.4-6.3-7.4-10c-3-5.7-4.6-12.1-4.6-18.9c0-22.5,18.3-40.8,40.8-40.8 c10.7,0,20.4,4.1,27.7,10.9c3.8,3.5,6.9,7.7,9.1,12.4c2.6,5.3,4,11.3,4,17.6C40.8,104.1,22.5,122.3,0,122.3z"/>
                    <path fill="${theme.fire}" d="M4.8,93.8c5.4,1.1,10.3,4.2,13.7,8.6l3.9-3c-4.1-5.3-10-9-16.6-10.4c-10.6-2.2-21.7,1.9-28.3,10.4l3.9,3 C-13.1,95.3-3.9,91.9,4.8,93.8z"/>
                    <circle fill="${theme.fire}" cx="-15" cy="71" r="4.9"/>
                    <circle fill="${theme.fire}" cx="15" cy="71" r="4.9"/>
                </g>
            </g>
        </g>
    </svg>`;
}

/** Remove animations from SVG. */
export function removeAnimations(svg: string): string {
  return svg
    .replace(STYLE_TAG_REGEX, '')
    .replace(/opacity: 0;/g, 'opacity: 1;')
    .replace(/animation: fadein[^;'"]+/g, 'opacity: 1;')
    .replace(/animation: currstreak[^;'"]+/g, 'font-size: 28px;')
    .replace(/<a [\s\S]*?>([\s\S]*?)<\/a>/g, '$1');
}

/** Convert a color from hex to hex + opacity components. */
function convertHexColor(color: string): ConvertedColor {
  const cleaned = color.replace(/[^0-9a-f]/gi, '');
  if (cleaned.length === 3) {
    const [r, g, b] = cleaned.split('');
    return {
      color: `#${r}${r}${g}${g}${b}${b}`,
      opacity: 1,
    };
  }
  if (cleaned.length === 4) {
    const [r, g, b, a] = cleaned.split('');
    return {
      color: `#${r}${r}${g}${g}${b}${b}`,
      opacity: parseInt(`${a}${a}`, 16) / 255,
    };
  }
  if (cleaned.length === 6) {
    return { color: `#${cleaned}`, opacity: 1 };
  }
  if (cleaned.length === 8) {
    return {
      color: `#${cleaned.slice(0, 6)}`,
      opacity: parseInt(cleaned.slice(6, 8), 16) / 255,
    };
  }
  throw new Error(`Invalid color: ${color}`);
}

/** Convert transparent hex colors to hex 6 digits and opacity attributes. */
export function convertHexColors(svg: string): string {
  // FIX: Use Double Quotes in replacement
  let processed = svg.replace(TRANSPARENT_ATTRIBUTE_REGEX, '$1="#0000"');
  processed = processed.replace(
    HEX_COLOR_ATTRIBUTE_REGEX,
    (_match, attribute, value) => {
      const { color, opacity } = convertHexColor(value);
      const opacityAttribute =
        attribute === 'stop-color' ? 'stop-opacity' : `${attribute}-opacity`;

      // FIX: Return Double Quoted attributes to match the rest of the SVG
      return `${attribute}="${color}" ${opacityAttribute}="${opacity}"`;
    }
  );

  return processed;
}
