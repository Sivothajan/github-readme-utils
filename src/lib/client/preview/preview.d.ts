export {};

// Define a type for hex color values
// when sending HEX colors, the '#' is omitted
declare type HexValue = string;

declare interface StreakPreviewOptions {
  // Basic Properties
  user: string;
  theme?: string;
  hide_border?: boolean;
  border_radius?: number;
  locale?: string;
  short_numbers?: boolean;

  date_format?:
    | 'M j[, Y]'
    | 'j M[ Y]'
    | '[Y ]M j'
    | 'j/n[/Y]'
    | 'n/j[/Y]'
    | '[Y.]n.j'
    | '';

  streak_mode?: 'daily' | 'weekly';

  exclude_days?: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'>;

  hide_total_contributions?: boolean;
  hide_current_streak?: boolean;
  hide_longest_streak?: boolean;

  card_width?: number;
  card_height?: number;
  type?: 'svg' | 'png' | 'json';

  // Advanced Properties
  background?: HexValue;
  border?: HexValue;
  stroke?: HexValue;
  ring?: HexValue;
  fire?: HexValue;
  currStreakNum?: HexValue;
  sideNums?: HexValue;
  currStreakLabel?: HexValue;
  sideLabels?: HexValue;
  dates?: HexValue;
  excludeDaysLabel?: HexValue;
}

export type { StreakPreviewOptions, HexValue };
