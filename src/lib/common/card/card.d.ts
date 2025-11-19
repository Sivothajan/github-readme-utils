export {};

declare type CardStats =
  | import('@/lib/api/github/github.d').GitHubContributionStatsResult
  | import('@/lib/api/github/github.d').GitHubWeeklyContributionStatsResult;

declare type CardRequestParams = Record<string, string | string[] | undefined>;

declare type LocaleTranslations = Record<string, string | boolean>;

declare type ConvertedColor = {
  color: string;
  opacity: number;
};

declare type TokenFormatter = (date: Date, locale: string) => string;

export type {
  CardStats,
  CardRequestParams,
  LocaleTranslations,
  ConvertedColor,
  TokenFormatter,
};
