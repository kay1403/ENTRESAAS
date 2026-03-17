import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Routes publiques
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Routes admin uniquement
  const adminRoutes = ['/users', '/roles', '/permissions', '/audit-logs'];
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // Si c'est la racine, rediriger vers dashboard ou login
  if (pathname === '/') {
    return NextResponse.redirect(new URL(token ? '/dashboard' : '/login', request.url));
  }

  // Si route protégée et pas de token
  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si route publique et token (déjà connecté)
  if (isPublicRoute && token && pathname !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Pour les routes admin, on vérifie le rôle dans le token (via API)
  // Mais on laisse le backend gérer l'autorisation

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
