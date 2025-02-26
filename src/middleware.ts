import { auth } from '@/lib/auth.config';
import {
  DEFAULT_REDIRECT,
  PUBLIC_ROUTES,
  ROOT,
  SYSADMIN_ROUTES
} from '@/lib/routes';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;

  const isAuthenticated = !!req.auth; // Verifica si está autenticado
  const isSysAdmin = req.auth?.isSystemAdmin; // Verifica si es un administrador del sistema
  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname); // Verifica si es una ruta pública
  const isSysAdminRoute = SYSADMIN_ROUTES.includes(nextUrl.pathname); // Verifica si es una ruta de administrador

  // Si el usuario está autenticado y está en una ruta pública, redirigir al dashboard
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
  }

  // Si no está autenticado y está en una ruta privada, redirigir al login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL(ROOT, nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si está autenticado pero no es sysadmin, y está intentando acceder a una ruta de sysadmin, redirigir a una página de "Unauthorized"
  if (isAuthenticated && !isSysAdmin && isSysAdminRoute) {
    return NextResponse.redirect(new URL('/unauthorized', nextUrl));
  }

  // Si no hay redirecciones, continuar normalmente
  return NextResponse.next(); // Usa NextResponse para continuar con la solicitud
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
