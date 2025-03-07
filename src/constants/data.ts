import { NavItem } from 'types';

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Solicitudes',
    url: '/dashboard/loan-requests',
    icon: 'requests',
    shortcut: ['s', 's'],
    isActive: false,
    items: []
  }
];

export const adminNavItems: NavItem[] = [
  ...navItems,
  {
    title: 'Configuración de Tasas',
    url: '/dashboard/company-configurations',
    icon: 'tasas',
    shortcut: ['c', 't'],
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

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
