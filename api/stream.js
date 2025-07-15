// api/stream.js
export const config = { runtime: 'edge' };

import { detectBot } from '../lib/defender';

export default async function handler(request) {
  // 1) Grab IP & UA
  const ip        = request.headers.get('x-forwarded-for')?.split(',')[0] || '';
  const userAgent = request.headers.get('user-agent') || '';

  // 2) Run Defender check
  try {
    const flags = await detectBot({ ip, userAgent });
    if (Object.values(flags).some(Boolean)) {
      // any true → redirect to blocked page
      return Response.redirect(new URL('/denied', request.url), 302);
    }
  } catch (err) {
    // on Defender failure, err on the side of blocking
    console.error('Defender error:', err);
    return Response.redirect(new URL('/denied', request.url), 302);
  }

  // 3) Otherwise stream through to your Worker
  const upstream = new URL(request.nextUrl.pathname + request.nextUrl.search,
                           'https://my-worker.example.workers.dev');
  const res = await fetch(upstream, {
    method:   request.method,
    headers:  request.headers,
    body:     request.body,
    redirect: 'manual',
  });

  return new Response(res.body, {
    status:  res.status,
    headers: res.headers,
  });
}
