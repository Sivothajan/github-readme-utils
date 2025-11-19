import { StreakPreviewOptions } from '@/lib/client/preview/preview';

export {};

declare type GitHubContributionDay = {
  date: string;
  contributionCount: number;
};

declare type GitHubContributionWeek = {
  contributionDays: GitHubContributionDay[];
};

declare type GitHubContributionCalendar = {
  weeks: GitHubContributionWeek[];
};

declare type GitHubContributionCollection = {
  contributionYears: number[];
  contributionCalendar: GitHubContributionCalendar;
};

declare type GitHubUser = {
  createdAt: string;
  contributionsCollection: GitHubContributionCollection;
};

declare type GitHubGraphQLResponse = {
  data?: {
    user?: GitHubUser;
  };
  errors?: Array<{
    message: string;
    type?: string;
  }>;
  message?: string;
};

declare type GitHubContributionGraphs = Record<number, GitHubGraphQLResponse>;

declare type GitHubStreak = {
  start: string;
  end: string;
  length: number;
};

declare type GitHubContributionStatsResult = {
  mode: 'daily';
  totalContributions: number;
  firstContribution: string;
  longestStreak: GitHubStreak;
  currentStreak: GitHubStreak;
  excludedDays: StreakPreviewOptions['exclude_days'];
};

declare type GitHubWeeklyContributionStatsResult = {
  mode: 'weekly';
  totalContributions: number;
  firstContribution: string;
  longestStreak: GitHubStreak;
  currentStreak: GitHubStreak;
};

export type {
  GitHubContributionDay,
  GitHubContributionWeek,
  GitHubContributionCalendar,
  GitHubContributionCollection,
  GitHubUser,
  GitHubGraphQLResponse,
  GitHubContributionGraphs,
  GitHubStreak,
  GitHubContributionStatsResult,
  GitHubWeeklyContributionStatsResult,
};
