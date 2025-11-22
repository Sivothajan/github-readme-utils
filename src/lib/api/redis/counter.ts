import config from '@/config/env.config';

const redisUrl = config.KV_REST_API_URL;
const redisToken = config.KV_REST_API_TOKEN;

export async function incrementCounter(key: string) {
  const safeKey = purifyKey(key); // Helper handles the encoding

  const res = await fetch(`${redisUrl}/incr/${safeKey}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${redisToken}` },
    cache: 'no-store', // Ensure fetch doesn't cache in Next.js
  });

  if (!res.ok) {
    console.error('Redis Incr Error:', await res.text());
    return '0';
  }
  const json = await res.json();
  return String(json.result || '0');
}

export async function getCounter(key: string) {
  const safeKey = purifyKey(key);

  const res = await fetch(`${redisUrl}/get/${safeKey}`, {
    headers: { Authorization: `Bearer ${redisToken}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    console.error('Redis Get Error:', await res.text());
    return '0';
  }
  const json = await res.json();
  return String(json.result || '0');
}

function purifyKey(key: string): string {
  if (!key) return 'views'; // Default key

  // Clean up the string format first
  let clean = key
    .trim()
    .replace(/\\/g, '/')
    .replace(/\/{2,}/g, '/');
  if (clean.length > 1 && clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }

  // Use standard encoding to make it safe for URL paths
  // "my/path" becomes "my%2Fpath"
  return encodeURIComponent(clean);
}
