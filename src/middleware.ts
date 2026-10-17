import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/modules/auth/auth.config';

// Middleware edge-safe : décode le JWT uniquement, n'importe JAMAIS
// Prisma ici (P1.8).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard');

  if (isOnDashboard && !isLoggedIn) {
    const loginUrl = new URL('/connexion', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Toutes les routes dashboard, API admin comprises
  matcher: ['/dashboard/:path*'],
};
