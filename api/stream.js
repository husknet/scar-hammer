// api/stream.js
export const config = { runtime: 'edge' };

import { detectBot } from '../lib/defender';

export default async function handler(request) {
  const url = new URL(request.url);

  // --- Defender check ---
  try {
    const ip        = request.headers.get('x-forwarded-for')?.split(',')[0] || '';
    const userAgent = request.headers.get('user-agent') || '';
    const flags     = await detectBot({ ip, userAgent });

    if (Object.values(flags).some(Boolean)) {
      console.warn('Blocked by defender:', flags);
      return Response.redirect(new URL('/denied', url), 302);
    }
  } catch (err) {
    console.error('Defender API error:', err);
    // safest to block if defender is down
    return Response.redirect(new URL('/denied', url), 302);
  }

  // --- Build upstream URL ---
  const PREFIX = '/api/stream';
  let path = url.pathname.startsWith(PREFIX)
    ? url.pathname.slice(PREFIX.length)
    : url.pathname;

  // if user just hit /api/stream, default to root
  if (!path) path = '/';

  const upstreamUrl = `https://my-worker.example.workers.dev${path}${url.search}`;

  // --- Proxy & stream ---
  try {
    const res = await fetch(upstreamUrl, {
      method:   request.method,
      headers:  request.headers,
      body:     request.body,
      redirect: 'manual'
    });

    return new Response(res.body, {
      status:  res.status,
      headers: res.headers
    });
  } catch (err) {
    console.error('Upstream fetch error:', err);
    return new Response(`Bad Gateway: ${err.message}`, { status: 502 });
  }
}
