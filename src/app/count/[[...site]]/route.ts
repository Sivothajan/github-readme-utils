import { NextRequest } from 'next/server';
import { getCounter, incrementCounter } from '@/lib/api/redis/counter';
import svg from '@/lib/common/counter/counter-batch.svg';
import config from '@/config/env.config';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  if (!config.KV_REST_API_URL || !config.KV_REST_API_URL) {
    const output = svg.replace(/\$\{count\}/g, 'missing config!');
    return new Response(output, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  }

  const userAgent = req.headers.get('user-agent') || '';
  const isFromGitHub = userAgent.toLowerCase().includes('camo');

  const url = new URL(req.url);
  const path = url.pathname;

  let count = '0';

  try {
    if (path === '/') {
      count = isFromGitHub ? await incrementCounter('') : await getCounter('');
    } else {
      count = await incrementCounter(path);
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
