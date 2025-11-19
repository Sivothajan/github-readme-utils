import { StreakPreviewOptions } from '@/lib/client/preview/preview.d';
import { CardStats } from '@/lib/common/card/card.d';

export const defaultOptions: StreakPreviewOptions = {
  user: 'Sivothajan',
  theme: 'default',
  hide_border: false,
  border_radius: 4.5,
  locale: 'en',
  short_numbers: false,
  date_format: '',
  streak_mode: 'daily',
  exclude_days: [],
  hide_total_contributions: false,
  hide_current_streak: false,
  hide_longest_streak: false,
  card_width: 495,
  card_height: 195,
  type: 'svg',
};

export const DEFAULT_OPTIONS: Record<string, string | number | boolean> = {
  theme: 'default',
  locale: 'en',
  mode: 'daily',
  type: 'svg',
  streak_mode: 'daily',
  border_radius: 4.5,
  card_width: 495,
  card_height: 195,
  hide_border: false,
  hide_total_contributions: false,
  hide_current_streak: false,
  hide_longest_streak: false,
  short_numbers: false,
  disable_animations: false,
  date_format: '',
  // Color defaults (empty means use theme/defaults)
  background: '',
  border: '',
  stroke: '',
  ring: '',
  fire: '',
  currStreakNum: '',
  sideNums: '',
  currStreakLabel: '',
  sideLabels: '',
  dates: '',
  excludeDaysLabel: '',
};

export const defaultDailyStats: CardStats = {
  mode: 'daily',
  totalContributions: 1798,
  firstContribution: '2021-05-23',
  longestStreak: {
    start: '2025-06-19',
    end: '2025-07-15',
    length: 27,
  },
  currentStreak: {
    start: '2025-11-19',
    end: '2025-11-19',
    length: 0,
  },
  excludedDays: [],
};

export const defaultWeeklyStats: CardStats = {
  mode: 'weekly',
  totalContributions: 1798,
  firstContribution: '2021-05-23',
  longestStreak: {
    start: '2025-01-19',
    end: '2025-11-16',
    length: 44,
  },
  currentStreak: {
    start: '2025-01-19',
    end: '2025-11-16',
    length: 44,
  },
};

export function formatToday(fmt: StreakPreviewOptions['date_format']): string {
  if (!fmt) {
    return 'Default';
  }

  const ymdt = new Date('2025-05-23T12:00:00Z');
  const tokens: Record<string, string | number> = {
    M: ymdt.toLocaleString('en', { month: 'short' }),
    j: ymdt.getDate(),
    Y: ymdt.getFullYear(),
    n: ymdt.getMonth() + 1,
  };

  let formatted: string = String(fmt);
  formatted = formatted.replace(/\[(.*?)\]/g, (_match, inner: string) => {
    const replaced = inner.replace(/[MjYn]/g, (t) => String(tokens[t]));
    return replaced.trim() ? replaced : '';
  });

  formatted = formatted.replace(/[MjYn]/g, (t) => String(tokens[t]));
  return formatted;
}

export const dateFormatValues: StreakPreviewOptions['date_format'][] = [
  '',
  'M j[, Y]',
  'j M[ Y]',
  '[Y ]M j',
  'j/n[/Y]',
  'n/j[/Y]',
  '[Y.]n.j',
];

export const outputTypesValues: StreakPreviewOptions['type'][] = [
  'svg',
  'png',
  'json',
];

export const weekdays: { short: string; full: string }[] = [
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
  { short: 'Sun', full: 'Sunday' },
];

export function compareOptionsType(
  optionsType: StreakPreviewOptions['type'],
  compareType: StreakPreviewOptions['type']
) {
  return optionsType === compareType ? true : false;
}
