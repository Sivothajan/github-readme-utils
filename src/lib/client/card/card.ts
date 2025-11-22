import { Canvg } from 'canvg';
import {
  removeAnimations,
  getParamValue,
  generateErrorCard,
  isParamTrue,
  generateCard,
  convertHexColors,
} from '@/lib/common/card/card';
import type { CardRequestParams, CardStats } from '@/lib/common/card/card.d';
import type { GeneratedResponse } from '@/lib/client/card/card.d';

/**
 * Sanitize SVG string for client-side rendering
 */
function sanitizeSvg(svg: string): string {
  return (
    svg
      // 1. Convert gradient offsets from % to decimal
      .replace(/offset="(\d+(\.\d+)?)%"/g, (_, p) => {
        const num = Number(p ?? '0');
        return `offset="${num / 100}"`;
      })

      // 2. Convert 4-digit hex colors (#RGBA) to 6-digit hex (#RRGGBB)
      .replace(/#([0-9a-fA-F]{4})\b/g, (_, hex) => {
        const [r, g, b] = (hex ?? '0000').split('');
        return `#${r}${r}${g}${g}${b}${b}`;
      })

      // 3. Remove <style> blocks (animations can break Canvg)
      .replace(/<style[\s\S]*?<\/style>/gi, '')

      // 4. Remove inline animation properties
      .replace(/animation:[^;"]+/gi, '')

      // 5. FORCE VISIBILITY: If animations are stripped, invisible elements must be shown
      .replace(/opacity:\s*0;?/gi, 'opacity: 1;')

      // 6. Handle font-family safely (stripping quotes for Canvg compatibility)
      .replace(/font-family=['"]([^'"]*)['"]/g, (_, val) => {
        // We simply use single quotes or no quotes to avoid attribute breaking
        return `font-family="${val.replace(/['"]/g, '')}"`;
      })

      // 7. Replace empty fill or stroke with safe default (#000)
      .replace(
        /\b(fill|stroke|stop-color)\s*=\s*['"]['"]/g,
        (_, a) => `${a}="#000"`
      )
  );
}

/**
 * Convert SVG string to PNG Blob in the browser
 */
async function convertSvgToPng(
  svg: string,
  width: number,
  height: number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // Sanitize SVG
  svg = sanitizeSvg(svg);

  // Verify SVG start to catch any aggressive regex deletions
  if (!svg.trim().startsWith('<svg')) {
    throw new Error('Sanitized SVG is invalid, not starting with <svg>');
  }

  const v = Canvg.fromString(ctx, svg);
  await v.render();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('Failed to convert SVG to PNG'));
      else resolve(blob);
    }, 'image/png');
  });
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

  // FIX: Always remove animations if PNG is requested.
  // Otherwise text elements with "opacity: 0" (waiting for animation) will be invisible.
  if (
    requestedType === 'png' ||
    isParamTrue(getParamValue(params, 'disable_animations'))
  ) {
    processedSvg = removeAnimations(processedSvg);
  }

  if (requestedType === 'png') {
    // Extract dimensions to set canvas size
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
