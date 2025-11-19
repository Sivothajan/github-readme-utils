import sharp from 'sharp';
import {
  removeAnimations,
  getParamValue,
  generateErrorCard,
  isParamTrue,
  generateCard,
  convertHexColors,
} from '@/lib/common/card/card';

import type { CardRequestParams, CardStats } from '@/lib/common/card/card.d';
import type { GeneratedResponse } from '@/lib/api/card/card.d';

import {
  getGitHubContributionGraphs,
  getGitHubContributionDates,
  getGitHubWeeklyContributionStats,
  getGitHubContributionStats,
  normalizeGitHubDays,
} from '@/lib/api/github/github';
import { StreakPreviewOptions } from '@/lib/client/preview/preview.d';

function paramsToObject(searchParams: URLSearchParams): CardRequestParams {
  const paramsObj: CardRequestParams = {};

  for (const [key, value] of searchParams.entries()) {
    if (key in paramsObj) {
      const existing = paramsObj[key];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        paramsObj[key] = [existing as string, value];
      }
    } else {
      paramsObj[key] = value;
    }
  }

  return paramsObj;
}

export const renderGitHubStatsCard = async (
  searchParams: URLSearchParams
): Promise<GeneratedResponse> => {
  try {
    // --- user ---
    const rawUser = searchParams.get('user');
    if (!rawUser) {
      return renderOutput('Missing required parameter: user', {}, 400);
    }

    // sanitize username
    const user = rawUser.replace(/[^a-zA-Z0-9\-]/g, '');

    // --- starting year ---
    const startingYear = searchParams.get('starting_year')
      ? parseInt(searchParams.get('starting_year')!, 10)
      : 2005;

    // --- fetch GitHub data ---
    const graphs = await getGitHubContributionGraphs(user, startingYear);
    const contributions = getGitHubContributionDates(graphs);

    // --- compute stats ---
    let stats;

    if (searchParams.get('mode') === 'weekly') {
      stats = getGitHubWeeklyContributionStats(contributions);
    } else {
      const excludeDaysStr = searchParams.get('exclude_days') ?? '';
      const excludeDays: StreakPreviewOptions['exclude_days'] =
        normalizeGitHubDays(excludeDaysStr.split(','));
      stats = getGitHubContributionStats(contributions, excludeDays);
    }

    // Success → return stats
    return renderOutput(stats, paramsToObject(searchParams));
  } catch (error: unknown) {
    const normalized =
      typeof error === 'object' && error !== null
        ? (error as { code?: unknown; message?: unknown })
        : {};

    const code = typeof normalized.code === 'number' ? normalized.code : 500;

    const message =
      typeof normalized.message === 'string'
        ? normalized.message
        : String(error);

    return renderOutput(message, paramsToObject(searchParams), code);
  }
};

/** Converts an SVG card to a PNG image. */
async function convertSvgToPng(
  svg: string,
  cardWidth: number,
  cardHeight: number
): Promise<Buffer> {
  // <-- Return a Promise
  const sanitized = removeAnimations(svg.trim()).replace(/\n/g, ' ');

  try {
    const buffer = await sharp(Buffer.from(sanitized))
      .resize(cardWidth, cardHeight)
      .png()
      .toBuffer(); // <-- Async call

    if (!buffer.length) throw new Error('Empty PNG buffer generated');
    return buffer;
  } catch (err) {
    throw new Error(`Failed to convert SVG to PNG: ${(err as Error).message}`);
  }
}

/** Return headers and response based on type. */
export async function generateOutput(
  output: string | CardStats,
  params: CardRequestParams = {}
): Promise<GeneratedResponse> {
  const requestedType = (getParamValue(params, 'type') ?? 'svg').toLowerCase();
  if (requestedType === 'json') {
    const data = typeof output === 'string' ? { error: output } : output;
    return {
      contentType: 'application/json',
      body: JSON.stringify(data),
    };
  }
  const svg =
    typeof output === 'string'
      ? generateErrorCard(output, params)
      : generateCard(output, params);
  let processedSvg = convertHexColors(svg);
  if (isParamTrue(getParamValue(params, 'disable_animations'))) {
    processedSvg = removeAnimations(processedSvg);
  }
  if (requestedType === 'png') {
    const widthMatch = processedSvg.match(/width=['"](\d+)px['"]/);
    const heightMatch = processedSvg.match(/height=['"](\d+)px['"]/);
    const width = widthMatch ? Number(widthMatch[1]) : 495;
    const height = heightMatch ? Number(heightMatch[1]) : 195;
    try {
      const body = await convertSvgToPng(processedSvg, width, height);
      return {
        contentType: 'image/png',
        body,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown conversion error';
      return {
        contentType: 'image/svg+xml',
        status: 500,
        body: generateErrorCard(message, params),
      };
    }
  }
  return {
    contentType: 'image/svg+xml',
    body: processedSvg,
  };
}

/** Set headers and output response metadata. */
export async function renderOutput(
  output: string | CardStats,
  params: CardRequestParams = {},
  responseCode = 200
): Promise<GeneratedResponse> {
  const response = await generateOutput(output, params);
  return {
    ...response,
    status: response.status ?? responseCode,
  };
}
