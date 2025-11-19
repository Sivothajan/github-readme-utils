import config from '@/config/env.config';
import type {
  GitHubUser,
  GitHubGraphQLResponse,
  GitHubContributionGraphs,
  GitHubContributionStatsResult,
  GitHubWeeklyContributionStatsResult,
} from '@/lib/api/github/github.d';
import { StreakPreviewOptions } from '@/lib/client/preview/preview.d';

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';
const GITHUB_USER_AGENT = 'GitHub-Readme-Streak-Stats';
const WEEKDAY_ABBREVIATIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_IN_MS = 24 * 60 * 60 * 1000;

let cachedGitHubTokens: string[] | null = null;

/**
 * Build the GraphQL query string for a GitHub user's contribution graph.
 */
function buildGitHubContributionGraphQuery(user: string, year: number): string {
  const start = `${year}-01-01T00:00:00Z`;
  const end = `${year}-12-31T23:59:59Z`;
  return `query {
        user(login: "${user}") {
            createdAt
            contributionsCollection(from: "${start}", to: "${end}") {
                contributionYears
                contributionCalendar {
                    weeks {
                        contributionDays {
                            contributionCount
                            date
                        }
                    }
                }
            }
        }
    }`;
}

/**
 * Execute GitHub contribution graph requests for multiple years with retry logic.
 */
async function executeGitHubContributionGraphRequests(
  user: string,
  years: number[]
): Promise<GitHubContributionGraphs> {
  if (!years.length) {
    return {};
  }
  const responses: GitHubContributionGraphs = {};
  await Promise.all(
    years.map(async (year) => {
      const query = buildGitHubContributionGraphQuery(user, year);
      const firstToken = getGitHubToken();
      let graph = await fetchGitHubGraphQLResponse(query, firstToken);
      if (!isGitHubContributionResponseValid(graph)) {
        const errorType = graph?.errors?.[0]?.type ?? '';
        const message = getGitHubResponseMessage(graph);
        if (errorType === 'NOT_FOUND') {
          throw new Error('Could not find a user with that name.');
        }
        if (isGitHubRateLimitMessage(message)) {
          removeGitHubToken(firstToken);
        }
        console.error(
          `First attempt to decode response for ${user}'s ${year} contributions failed. ${message ?? 'An API error occurred.'}`
        );
        const retryToken = getGitHubToken();
        graph = await fetchGitHubGraphQLResponse(query, retryToken);
        if (!isGitHubContributionResponseValid(graph)) {
          const retryMessage = getGitHubResponseMessage(graph);
          if (graph?.errors?.[0]?.type === 'NOT_FOUND') {
            throw new Error('Could not find a user with that name.');
          }
          if (isGitHubRateLimitMessage(retryMessage)) {
            removeGitHubToken(retryToken);
          }
          console.error(
            `Failed to decode response for ${user}'s ${year} contributions after 2 attempts. ${retryMessage ?? 'An API error occurred.'}`
          );
          return;
        }
      }
      if (!graph) {
        return;
      }
      responses[year] = graph;
    })
  );
  return responses;
}

/**
 * Retrieve GitHub contribution graphs for the current year and historical years.
 */
export async function getGitHubContributionGraphs(
  user: string,
  startingYear?: number
): Promise<GitHubContributionGraphs> {
  const currentYear = new Date().getUTCFullYear();
  const currentYearResponses = await executeGitHubContributionGraphRequests(
    user,
    [currentYear]
  );
  const currentYearGraph = currentYearResponses[currentYear];
  const userCreatedDateTimeString =
    currentYearGraph?.data?.user?.createdAt ?? null;
  if (!userCreatedDateTimeString) {
    throw new Error(
      'Failed to retrieve contributions. This is likely a GitHub API issue.'
    );
  }
  const userCreatedYear = parseInt(userCreatedDateTimeString.split('-')[0], 10);
  let minimumYear = startingYear ?? userCreatedYear;
  minimumYear = Math.max(minimumYear, 2005);
  const yearsToRequest: number[] = [];
  for (let year = minimumYear; year < currentYear; year += 1) {
    yearsToRequest.push(year);
  }
  const contributionYears =
    currentYearGraph?.data?.user?.contributionsCollection?.contributionYears ??
    [];
  const firstContributionYear =
    contributionYears[contributionYears.length - 1] ?? userCreatedYear;
  if (
    firstContributionYear < 2005 &&
    !yearsToRequest.includes(firstContributionYear)
  ) {
    yearsToRequest.unshift(firstContributionYear);
  }
  if (yearsToRequest.length) {
    const pastResponses = await executeGitHubContributionGraphRequests(
      user,
      yearsToRequest
    );
    Object.assign(currentYearResponses, pastResponses);
  }
  return currentYearResponses;
}

/**
 * Read GitHub tokens (GITHUB_TOKEN, GITHUB_TOKEN2, etc.) from environment variables.
 */
function getGitHubTokens(): string[] {
  if (cachedGitHubTokens) {
    return cachedGitHubTokens;
  }
  const tokens: string[] = [];
  const primaryToken = config.GITHUB_TOKEN;
  if (primaryToken) {
    tokens.push(primaryToken);
  }
  let index = 2;
  // Use a string-indexable view of config to access GITHUB_TOKEN2, GITHUB_TOKEN3, ...
  const configMap = config as unknown as Record<string, string | undefined>;
  while (true) {
    const key = `GITHUB_TOKEN${index}`;
    const value = configMap[key];
    if (!value) {
      break;
    }
    tokens.push(value);
    index += 1;
  }
  cachedGitHubTokens = tokens;
  return tokens;
}

/**
 * Get a GitHub token from the token pool.
 */
function getGitHubToken(): string {
  const tokens = getGitHubTokens();
  if (!tokens.length) {
    throw new Error('There is no GitHub token available.');
  }
  const randomIndex = Math.floor(Math.random() * tokens.length);
  return tokens[randomIndex];
}

/**
 * Remove a GitHub token when it hits rate limits.
 */
function removeGitHubToken(token: string): void {
  if (!cachedGitHubTokens) {
    cachedGitHubTokens = getGitHubTokens();
  }
  const index = cachedGitHubTokens.indexOf(token);
  if (index !== -1) {
    cachedGitHubTokens.splice(index, 1);
  }
  if (!cachedGitHubTokens.length) {
    throw new Error(
      'We are being rate-limited! Check https://git.io/streak-ratelimit for details.'
    );
  }
}

/**
 * Fetch a GitHub GraphQL response using the provided query and token.
 */
async function fetchGitHubGraphQLResponse(
  query: string,
  token: string
): Promise<GitHubGraphQLResponse | undefined> {
  try {
    const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v4.idl',
        'User-Agent': GITHUB_USER_AGENT,
      },
      body: JSON.stringify({ query }),
    });
    const text = await response.text();
    if (!text) {
      return undefined;
    }
    try {
      return JSON.parse(text) as GitHubGraphQLResponse;
    } catch (error) {
      console.error('Failed to parse GitHub GraphQL response.', error);
      return undefined;
    }
  } catch (error) {
    console.error('GitHub GraphQL request failed.', error);
    return undefined;
  }
}

/**
 * Collect GitHub contributions grouped by date (YYYY-MM-DD).
 */
export function getGitHubContributionDates(
  contributionGraphs: GitHubContributionGraphs
): Record<string, number> {
  const contributions: Record<string, number> = {};
  const today = formatGitHubDate(new Date());
  const tomorrowDate = new Date(Date.now() + DAY_IN_MS);
  const tomorrow = formatGitHubDate(tomorrowDate);
  const years = Object.keys(contributionGraphs)
    .map((year) => Number(year))
    .sort((a, b) => a - b);
  for (const year of years) {
    const graph = contributionGraphs[year];
    const weeks =
      graph?.data?.user?.contributionsCollection?.contributionCalendar?.weeks ??
      [];
    for (const week of weeks) {
      const days = week?.contributionDays ?? [];
      for (const day of days) {
        const date = day.date;
        const count = day.contributionCount;
        if (date <= today || (date === tomorrow && count > 0)) {
          contributions[date] = count;
        }
      }
    }
  }
  return contributions;
}

/**
 * Normalize GitHub weekday names to three-letter abbreviations.
 */
export function normalizeGitHubDays(
  days: string[]
): StreakPreviewOptions['exclude_days'] {
  const normalized = days
    .map((day) => day.trim())
    .map((day) => day.slice(0, 3).toLowerCase())
    .map((day) => {
      const index = WEEKDAY_ABBREVIATIONS.findIndex(
        (abbr) => abbr.toLowerCase() === day
      );
      return index === -1 ? null : WEEKDAY_ABBREVIATIONS[index];
    })
    .filter(
      (day): day is NonNullable<StreakPreviewOptions['exclude_days']>[number] =>
        Boolean(day)
    );

  return normalized as StreakPreviewOptions['exclude_days'];
}

/**
 * Determine if a GitHub contribution date should be excluded.
 */
function isGitHubExcludedDay(date: string, excludedDays: string[]): boolean {
  if (!excludedDays.length) {
    return false;
  }
  const weekday = getGitHubWeekdayAbbreviation(date);
  return excludedDays.includes(weekday);
}

/**
 * Build GitHub contribution stats with streak information.
 */
export function getGitHubContributionStats(
  contributions: Record<string, number>,
  excludedDays: StreakPreviewOptions['exclude_days'] = []
): GitHubContributionStatsResult {
  const dates = Object.keys(contributions).sort();
  if (!dates.length) {
    throw new Error('No contributions found.');
  }
  const today = dates[dates.length - 1];
  const first = dates[0];
  const stats: GitHubContributionStatsResult = {
    mode: 'daily',
    totalContributions: 0,
    firstContribution: '',
    longestStreak: { start: first, end: first, length: 0 },
    currentStreak: { start: first, end: first, length: 0 },
    excludedDays,
  };
  for (const date of dates) {
    const count = contributions[date];
    stats.totalContributions += count;
    if (
      count > 0 ||
      (stats.currentStreak.length > 0 &&
        isGitHubExcludedDay(date, excludedDays))
    ) {
      stats.currentStreak.length += 1;
      stats.currentStreak.end = date;
      if (stats.currentStreak.length === 1) {
        stats.currentStreak.start = date;
      }
      if (!stats.firstContribution) {
        stats.firstContribution = date;
      }
      if (stats.currentStreak.length > stats.longestStreak.length) {
        stats.longestStreak = {
          start: stats.currentStreak.start,
          end: stats.currentStreak.end,
          length: stats.currentStreak.length,
        };
      }
    } else if (date !== today) {
      stats.currentStreak = { start: today, end: today, length: 0 };
    }
  }
  if (!stats.firstContribution) {
    stats.firstContribution = first;
  }
  return stats;
}

/**
 * Calculate the previous Sunday for a GitHub contribution date.
 */
function getGitHubPreviousSunday(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  const dayOfWeek = parsed.getUTCDay();
  parsed.setUTCDate(parsed.getUTCDate() - dayOfWeek);
  return formatGitHubDate(parsed);
}

/**
 * Build weekly GitHub contribution stats with streak information.
 */
export function getGitHubWeeklyContributionStats(
  contributions: Record<string, number>
): GitHubWeeklyContributionStatsResult {
  const dates = Object.keys(contributions).sort();
  if (!dates.length) {
    throw new Error('No contributions found.');
  }
  const thisWeek = getGitHubPreviousSunday(dates[dates.length - 1]);
  const firstDate = dates[0];
  const firstWeek = getGitHubPreviousSunday(firstDate);
  const stats: GitHubWeeklyContributionStatsResult = {
    mode: 'weekly',
    totalContributions: 0,
    firstContribution: '',
    longestStreak: { start: firstWeek, end: firstWeek, length: 0 },
    currentStreak: { start: firstWeek, end: firstWeek, length: 0 },
  };
  const weeks: Record<string, number> = {};
  for (const date of dates) {
    const week = getGitHubPreviousSunday(date);
    if (!Object.prototype.hasOwnProperty.call(weeks, week)) {
      weeks[week] = 0;
    }
    const count = contributions[date];
    if (count > 0) {
      weeks[week] += count;
      if (!stats.firstContribution) {
        stats.firstContribution = date;
      }
    }
  }
  const orderedWeeks = Object.keys(weeks).sort();
  for (const week of orderedWeeks) {
    const count = weeks[week];
    stats.totalContributions += count;
    if (count > 0) {
      stats.currentStreak.length += 1;
      stats.currentStreak.end = week;
      if (stats.currentStreak.length === 1) {
        stats.currentStreak.start = week;
      }
      if (stats.currentStreak.length > stats.longestStreak.length) {
        stats.longestStreak = {
          start: stats.currentStreak.start,
          end: stats.currentStreak.end,
          length: stats.currentStreak.length,
        };
      }
    } else if (week !== thisWeek) {
      stats.currentStreak = { start: thisWeek, end: thisWeek, length: 0 };
    }
  }
  if (!stats.firstContribution) {
    stats.firstContribution = firstDate;
  }
  return stats;
}

/**
 * Ensure a GitHub contribution response contains user data.
 */
function isGitHubContributionResponseValid(
  response?: GitHubGraphQLResponse
): response is GitHubGraphQLResponse & { data: { user: GitHubUser } } {
  return Boolean(response?.data?.user);
}

/**
 * Extract the primary GitHub error message from a response payload.
 */
function getGitHubResponseMessage(
  response?: GitHubGraphQLResponse
): string | undefined {
  return response?.errors?.[0]?.message ?? response?.message;
}

/**
 * Check whether a GitHub error message indicates rate limiting.
 */
function isGitHubRateLimitMessage(message?: string): boolean {
  return Boolean(
    message && message.toLowerCase().includes('rate limit exceeded')
  );
}

/**
 * Compute the GitHub weekday abbreviation (Sun-Sat) for a date string.
 */
function getGitHubWeekdayAbbreviation(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);
  const dayIndex = parsed.getUTCDay();
  return WEEKDAY_ABBREVIATIONS[dayIndex];
}

/**
 * Format a Date instance as a GitHub-friendly YYYY-MM-DD string.
 */
function formatGitHubDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
