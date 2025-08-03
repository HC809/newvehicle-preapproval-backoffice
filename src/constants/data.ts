import { NavItem } from 'types';

// Determinar si estamos en modo de desarrollo
//const isDevelopment = process.env.NODE_ENV === 'development';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Notificaciones',
    url: '/dashboard/notifications',
    icon: 'notifications',
    isActive: false,
    shortcut: ['n', 'n'],
    items: []
  },
  {
    title: 'Solicitudes',
    url: '/dashboard/loan-requests',
    icon: 'requests',
    shortcut: ['s', 's'],
    isActive: false,
    items: []
  },
  {
    title: 'Clientes',
    url: '/dashboard/clients',
    icon: 'clients',
    shortcut: ['u', 'u'],
    isActive: false,
    items: []
  },
  {
    title: 'Configuración Financiera',
    url: '/dashboard/company-configurations',
    icon: 'tasas',
    shortcut: ['c', 'f'],
    isActive: false,
    items: []
  },
  {
    title: 'Tipos de Vehículos',
    url: '/dashboard/vehicle-types',
    icon: 'car',
    shortcut: ['v', 'v'],
    isActive: false,
    items: []
  },
  {
    title: 'Usuarios',
    url: '/dashboard/users',
    icon: 'users',
    shortcut: ['u', 'u'],
    isActive: false,
    items: []
  },
  {
    title: 'Concesionarias',
    url: '/dashboard/dealerships',
    icon: 'concesionaria',
    shortcut: ['c', 'c'],
    isActive: false,
    items: []
  }
];
