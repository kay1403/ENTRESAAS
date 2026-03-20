import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes publiques
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Debug
  console.log(`[Middleware] Path: ${pathname}, Token present: ${!!token}`);

  // Vérifier si la route est publique
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // Si l'utilisateur est déjà connecté, rediriger vers dashboard
    if (token) {
      console.log('[Middleware] User already logged in, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Vérifier si l'utilisateur est connecté
  if (!token) {
    console.log('[Middleware] No token, redirecting to login');
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
