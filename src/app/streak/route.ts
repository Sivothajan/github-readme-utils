import { NextRequest, NextResponse } from 'next/server';
import { renderGitHubStatsCard } from '@/lib/api/card/card';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const data = await renderGitHubStatsCard(searchParams);
  const body =
    typeof data.body === 'string' ? data.body : new Uint8Array(data.body); // Buffer → Uint8Array

  const response = new NextResponse(body, {
    status: data.status,
    headers: {
      'Content-Type': data.contentType,
      'Cache-Control': 'public, max-age=600',
    },
  });

  return response;
}
