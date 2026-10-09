import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // E.g., 'hakunamatata.storecraft-ecru.vercel.app'
  // Or locally: 'hakunamatata.localhost:3000'
  const isVercel = hostname.includes('vercel.app');
  const isLocalhost = hostname.includes('localhost');
  const isProsess = hostname.includes('prosess.in');

  // Skip api, _next, static files
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Detect subdomain
  let subdomain = '';
  if (isProsess) {
    // E.g. "hakunamatata.stores.prosess.in" -> parts: ['hakunamatata', 'stores', 'prosess', 'in']
    const parts = hostname.split('.');
    if (parts.length >= 4) {
      subdomain = parts[0];
    } else if (parts.length === 3 && parts[0] !== 'stores' && parts[0] !== 'www') {
      subdomain = parts[0];
    }
  } else if (isVercel) {
    // If hostname is "slug.storecraft-ecru.vercel.app"
    const parts = hostname.split('.');
    if (parts.length > 3) {
      subdomain = parts[0];
    }
  } else if (isLocalhost) {
    // "slug.localhost:3000"
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      subdomain = parts[0];
    }
  }

  // If there is a subdomain, rewrite to /store/[slug]
  if (subdomain && subdomain !== 'www') {
    // If they go to / (root of subdomain), rewrite to /store/[slug]
    if (url.pathname === '/') {
      return NextResponse.rewrite(new URL(`/store/${subdomain}`, req.url));
    }
    // If they go to /products, etc., rewrite to /store/[slug]/products
    return NextResponse.rewrite(new URL(`/store/${subdomain}${url.pathname}`, req.url));
  }

  return NextResponse.next();
}
