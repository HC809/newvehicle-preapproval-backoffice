'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
  title: string;
  link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
  '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
  '/dashboard/employee': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Empleados', link: '/dashboard/employee' }
  ],
  '/dashboard/product': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Productos', link: '/dashboard/product' }
  ],
  '/dashboard/loan-requests': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Solicitudes', link: '/dashboard/loan-requests' }
  ],
  '/dashboard/users': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Usuarios', link: '/dashboard/users' }
  ],
  '/dashboard/dealerships': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Concesionarias', link: '/dashboard/dealerships' }
  ],
  '/dashboard/vehicle-types': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Tipos de Vehículos', link: '/dashboard/vehicle-types' }
  ],
  '/dashboard/overview': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Resumen', link: '/dashboard/overview' }
  ],
  '/dashboard/kanban': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Kanban', link: '/dashboard/kanban' }
  ],
  '/dashboard/profile': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Perfil', link: '/dashboard/profile' }
  ]
  // Add more custom mappings as needed
};

export function useBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }

    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split('/').filter(Boolean);

    // Handle dynamic routes for loan-requests
    if (
      segments.length > 2 &&
      segments[0] === 'dashboard' &&
      segments[1] === 'loan-requests'
    ) {
      return [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'Solicitudes', link: '/dashboard/loan-requests' },
        { title: 'Detalle', link: pathname }
      ];
    }

    // Handle dynamic routes for product details
    if (
      segments.length > 2 &&
      segments[0] === 'dashboard' &&
      segments[1] === 'product'
    ) {
      return [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'Productos', link: '/dashboard/product' },
        { title: 'Detalle', link: pathname }
      ];
    }

    // Handle dynamic routes for users
    if (
      segments.length > 2 &&
      segments[0] === 'dashboard' &&
      segments[1] === 'users'
    ) {
      return [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'Usuarios', link: '/dashboard/users' },
        { title: 'Detalle', link: pathname }
      ];
    }

    // Handle dynamic routes for dealerships
    if (
      segments.length > 2 &&
      segments[0] === 'dashboard' &&
      segments[1] === 'dealerships'
    ) {
      return [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'Concesionarias', link: '/dashboard/dealerships' },
        { title: 'Detalle', link: pathname }
      ];
    }

    // Handle dynamic routes for vehicle-types
    if (
      segments.length > 2 &&
      segments[0] === 'dashboard' &&
      segments[1] === 'vehicle-types'
    ) {
      return [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'Tipos de Vehículos', link: '/dashboard/vehicle-types' },
        { title: 'Detalle', link: pathname }
      ];
    }

    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;

      // Translate common segments to Spanish
      let title = segment.charAt(0).toUpperCase() + segment.slice(1);

      // Spanish translations for common URL segments
      const translations: Record<string, string> = {
        dashboard: 'Dashboard', // Keep Dashboard in English
        'loan-requests': 'Solicitudes',
        users: 'Usuarios',
        dealerships: 'Concesionarias',
        'vehicle-types': 'Tipos de Vehículos',
        overview: 'Resumen',
        kanban: 'Kanban',
        profile: 'Perfil',
        employee: 'Empleados',
        product: 'Productos'
      };

      if (translations[segment]) {
        title = translations[segment];
      }

      return {
        title,
        link: path
      };
    });
  }, [pathname]);

  return breadcrumbs;
}
