'use client';

import { useSession } from 'next-auth/react';
import { NavItem } from 'types';
import { hasRoleAccess } from '@/lib/routes';

interface FilteredNavProps {
  items: NavItem[];
  children: (filteredItems: NavItem[]) => React.ReactNode;
}

export function FilteredNav({ items, children }: FilteredNavProps) {
  const { data: session } = useSession();
  const userRole = session?.role;

  const filteredItems = items.filter((item) => {
    // Si no hay usuario autenticado, no mostrar nada
    if (!userRole) {
      return false;
    }

    // Verificar acceso basado en rutas usando el sistema de permisos
    return hasRoleAccess(userRole, item.url);
  });

  return <>{children(filteredItems)}</>;
}
