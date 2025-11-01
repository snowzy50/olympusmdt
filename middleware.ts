import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production',
  });

  const { pathname } = request.nextUrl;

  // Routes publiques
  const publicRoutes = ['/login', '/admin', '/api/auth'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si l'utilisateur est connecté et essaie d'accéder à la page de login ou admin
  if (token && (pathname === '/login' || pathname === '/admin')) {
    return NextResponse.redirect(new URL('/agency-selection', request.url));
  }

  // Protection de la page agency-selection
  if (pathname.startsWith('/agency-selection') && token) {
    const agencies = token.agencies as string[] || [];
    const isAdmin = token.isAdmin as boolean;

    console.log('[MIDDLEWARE] User token:', {
      discordId: token.discordId,
      discordRoles: token.discordRoles,
      agencies: token.agencies,
      isAdmin: isAdmin,
    });

    // Bypass pour l'admin
    if (isAdmin) {
      return NextResponse.next();
    }

    if (agencies.length === 0) {
      console.log('[MIDDLEWARE] NO AGENCIES - Redirecting to login');
      // Rediriger vers une page d'erreur si l'utilisateur n'a aucun rôle
      const errorUrl = new URL('/login', request.url);
      errorUrl.searchParams.set('error', 'no_roles');
      return NextResponse.redirect(errorUrl);
    }
  }

  // Protection des dashboards par agence
  if (pathname.startsWith('/dashboard/')) {
    const pathSegments = pathname.split('/').filter(Boolean);
    const agencyId = pathSegments[1]; // dashboard est à [0], agency à [1]
    const userAgencies = token?.agencies as string[] || [];
    const isAdmin = token?.isAdmin as boolean;

    // Bypass pour l'admin
    if (isAdmin) {
      return NextResponse.next();
    }

    // Si l'utilisateur n'a pas d'agences, rediriger vers login avec erreur
    if (userAgencies.length === 0) {
      const errorUrl = new URL('/login', request.url);
      errorUrl.searchParams.set('error', 'no_roles');
      return NextResponse.redirect(errorUrl);
    }

    // Vérifier que l'utilisateur a accès à cette agence spécifique
    if (!userAgencies.includes(agencyId)) {
      console.log(`[MIDDLEWARE] Access denied - User does not have access to agency: ${agencyId}`);
      console.log(`[MIDDLEWARE] User agencies:`, userAgencies);
      // L'utilisateur n'a pas accès à cette agence
      return NextResponse.redirect(new URL('/agency-selection', request.url));
    }

    // Accès autorisé
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (static images)
     */
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};
