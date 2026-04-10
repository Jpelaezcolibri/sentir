import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'fallback-secret'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login' || pathname === '/api/admin/auth/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin-token')?.value;
  if (!token) return handleUnauthorized(request, pathname);

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return handleUnauthorized(request, pathname);
  }
}

function handleUnauthorized(request: NextRequest, pathname: string) {
  if (pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  return NextResponse.redirect(new URL('/admin/login', request.url));
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
