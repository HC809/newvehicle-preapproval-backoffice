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
  '/dashboard/notifications': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Notificaciones', link: '/dashboard/notifications' }
  ],
  '/dashboard/clients': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Clientes', link: '/dashboard/clients' }
  ],
  '/dashboard/company-configurations': [
    { title: 'Dashboard', link: '/dashboard' },
    {
      title: 'Configuración Financiera',
      link: '/dashboard/company-configurations'
    }
  ],
  '/dashboard/diagnostics': [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Diagnósticos', link: '/dashboard/diagnostics' }
  ]
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

    // Handle dynamic routes for clients
    if (
      segments.length > 2 &&
      segments[0] === 'dashboard' &&
      segments[1] === 'clients'
    ) {
      return [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'Clientes', link: '/dashboard/clients' },
        { title: 'Detalle', link: pathname }
      ];
    }

    // Handle dynamic routes for chat
    if (
      segments.length > 3 &&
      segments[0] === 'dashboard' &&
      segments[1] === 'chat' &&
      segments[2] === 'loanRequestId'
    ) {
      return [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'Chat', link: '/dashboard/chat' },
        { title: 'Solicitud', link: pathname }
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
        notifications: 'Notificaciones',
        clients: 'Clientes',
        'company-configurations': 'Configuración Financiera',
        diagnostics: 'Diagnósticos',
        chat: 'Chat',
        loanRequestId: 'Solicitud'
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
