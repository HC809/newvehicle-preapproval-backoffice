export const ROOT = '/';
export const PUBLIC_ROUTES = [
  ROOT,
  '/auth/set-password',
  '/auth/signin',
  '/unauthorized'
];
export const DEFAULT_REDIRECT = '/dashboard';

// Rutas comunes disponibles para todos los usuarios autenticados
export const COMMON_ROUTES = ['/dashboard', '/dashboard/notifications'];

// Definir rutas por rol específico
export const ROLE_ROUTES: Record<string, string[]> = {
  IT_Admin: [
    ...COMMON_ROUTES,
    '/dashboard/users',
    '/dashboard/dealerships',
    '/dashboard/company-configurations',
    '/dashboard/vehicle-types',
    '/dashboard/diagnostics'
  ],
  BusinessDevelopment_Admin: [
    ...COMMON_ROUTES,
    '/dashboard/loan-requests',
    '/dashboard/referred-loan-requests',
    '/dashboard/clients',
    '/dashboard/users',
    '/dashboard/dealerships',
    '/dashboard/company-configurations',
    '/dashboard/vehicle-types'
  ],
  BusinessDevelopment_User: [
    ...COMMON_ROUTES,
    '/dashboard/loan-requests',
    '/dashboard/referred-loan-requests',
    '/dashboard/clients'
  ],
  Dealership_Admin: [
    ...COMMON_ROUTES,
    '/dashboard/loan-requests',
    '/dashboard/clients'
  ],
  PYMEAdvisor: [...COMMON_ROUTES, '/dashboard/referred-loan-requests'],
  BranchManager: [
    ...COMMON_ROUTES,
    '/dashboard/loan-requests',
    '/dashboard/clients'
  ],
  FinancialAdvisor: [...COMMON_ROUTES, '/dashboard/referred-loan-requests'],
  ContactCenterAgent: [...COMMON_ROUTES, '/dashboard/referred-loan-requests']
};

// Función helper para verificar si un rol tiene acceso a una ruta
export function hasRoleAccess(userRole: string, pathname: string): boolean {
  // Si es una ruta común, permitir acceso a todos los usuarios autenticados
  if (COMMON_ROUTES.includes(pathname)) {
    return true;
  }

  const allowedRoutes = ROLE_ROUTES[userRole];

  // Si no hay rutas definidas para el rol, denegar acceso
  if (!allowedRoutes) {
    return false;
  }

  // Si la ruta está en la lista de rutas permitidas, permitir acceso
  if (allowedRoutes.includes(pathname)) {
    return true;
  }

  // Si la ruta está definida en ROLE_ROUTES pero no para este rol, denegar acceso
  const allDefinedRoutes = Object.values(ROLE_ROUTES).flat();
  if (allDefinedRoutes.includes(pathname)) {
    return false;
  }

  // Si la ruta no está definida en ROLE_ROUTES, permitir acceso (rutas no restringidas)
  return true;
}
