import { auth } from '@/lib/auth.config';
import {
  DEFAULT_REDIRECT,
  PUBLIC_ROUTES,
  ROOT,
  hasRoleAccess
} from '@/lib/routes';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;

  const isAuthenticated = !!req.auth; // Verifica si está autenticado
  const userRole = req.auth?.user?.role; // Obtiene el rol del usuario
  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname); // Verifica si es una ruta pública

  // Si el usuario está autenticado y está en una ruta pública (excepto /unauthorized), redirigir al dashboard
  if (
    isAuthenticated &&
    isPublicRoute &&
    nextUrl.pathname !== '/unauthorized'
  ) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
  }

  // Si no está autenticado y está en una ruta privada, redirigir al login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL(ROOT, nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si está autenticado y tiene un rol, verificar permisos basados en rol
  if (isAuthenticated && userRole && !isPublicRoute) {
    const hasAccess = hasRoleAccess(userRole, nextUrl.pathname);

    // Si no tiene acceso a la ruta según su rol, redirigir a unauthorized
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl));
    }
  }

  // Si no hay redirecciones, continuar normalmente
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
