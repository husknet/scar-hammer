// api/stream.js
export const config = { runtime: 'edge' };

import { detectBot } from '../lib/defender';

export default async function handler(request) {
  try {
    // 1) Get client IP & UA
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '';
    const userAgent = request.headers.get('user-agent') || '';

    // 2) Defender check
    const flags = await detectBot({ ip, userAgent });
    if (Object.values(flags).some(Boolean)) {
      // Redirect any flagged clients
      return Response.redirect(new URL('/denied', request.url), 302);
    }

    // 3) Parse incoming URL
    const incoming = new URL(request.url);
    // Remove `/api/stream` prefix from the pathname:
    const upstreamPath = incoming.pathname.replace(/^\/api\/stream/, '') + incoming.search;
    const upstreamUrl = `https://my-worker.example.workers.dev${upstreamPath}`;

    // 4) Proxy & stream
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
    console.error('Stream handler error:', err);
    // On any unexpected error, surface a 502 so you can distinguish
    return new Response('Bad Gateway', { status: 502 });
  }
}
