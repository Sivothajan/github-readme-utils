import { NextRequest } from 'next/server';
import { getCounter, incrementCounter } from '@/lib/api/redis/counter';
import svg from '@/lib/common/counter/counter-batch.svg';
import config from '@/config/env.config';

export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ site?: string[] }> }
) {
  // Await the params promise
  const { site } = await params;

  if (!config.KV_REST_API_URL || !config.KV_REST_API_TOKEN) {
    return new Response(svg.replace(/\$\{count\}/g, 'Error'), {
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }

  // If site is undefined or empty array, we are at /count (or /api/count)
  const pathSegments = site || [];
  const isRoot = pathSegments.length === 0;

  // Check User Agent
  const userAgent = req.headers.get('user-agent') || '';
  const isFromGitHub = userAgent.toLowerCase().includes('camo');

  // Determine Redis Key (ID)
  const url = new URL(req.url);
  let dbKey = '';

  if (isRoot) {
    // If at root, look for ?id= parameter, default to 'views'
    dbKey = url.searchParams.get('id') || 'views';
  } else {
    // If at /count/username/repo, use "username/repo" as the key
    dbKey = pathSegments.join('/');
  }

  let count = '0';

  try {
    if (isRoot) {
      // --- LOGIC FOR ROOT ---
      // GitHub -> Increment
      // Browser/Others -> Read Only
      if (isFromGitHub) {
        count = await incrementCounter(dbKey);
      } else {
        count = await getCounter(dbKey);
      }
    } else {
      // --- LOGIC FOR SUB-PATHS ---
      // /count/something always increments
      count = await incrementCounter(dbKey);
    }
  } catch (err) {
    console.error('Redis error:', err);
  }

  const output = svg.replace(/\$\{count\}/g, String(count));

  return new Response(output, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}
