'use client';

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';

// Función para obtener las iniciales correctas del nombre
function getInitials(name: string): string {
  if (!name) return 'CN';

  const nameParts = name
    .trim()
    .split(' ')
    .filter((part) => part.length > 0);

  if (nameParts.length === 1) {
    // Un solo nombre: primera letra
    return nameParts[0].charAt(0).toUpperCase();
  } else if (nameParts.length === 2) {
    // Dos partes: primera letra de cada parte
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  } else if (nameParts.length === 3) {
    // Tres partes: primera letra del primer nombre + primera letra del apellido
    return (nameParts[0].charAt(0) + nameParts[2].charAt(0)).toUpperCase();
  } else {
    // Cuatro o más partes: primera letra del primer nombre + primera letra del primer apellido
    return (nameParts[0].charAt(0) + nameParts[2].charAt(0)).toUpperCase();
  }
}

// Función para obtener el nombre abreviado para el input
function getShortName(name: string): string {
  if (!name) return '';

  const nameParts = name
    .trim()
    .split(' ')
    .filter((part) => part.length > 0);

  if (nameParts.length === 1) {
    // Un solo nombre: mostrarlo completo
    return nameParts[0];
  } else if (nameParts.length === 2) {
    // Dos partes: mostrar ambos (nombre y apellido)
    return `${nameParts[0]} ${nameParts[1]}`;
  } else if (nameParts.length === 3) {
    // Tres partes: primer nombre + primer apellido
    return `${nameParts[0]} ${nameParts[2]}`;
  } else {
    // Cuatro o más partes: primer nombre + primer apellido
    return `${nameParts[0]} ${nameParts[2]}`;
  }
}

export function NavUser({
  user
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='min-h-[4.5rem] rounded-lg py-3 transition-all duration-200 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-full shadow-sm ring-2 ring-yellow-500 dark:ring-[#F7E605]'>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className='rounded-full bg-[#013B7C] font-semibold text-white dark:bg-blue-600'>
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 justify-center gap-1.5 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>
                  {getShortName(user.name)}
                </span>
                <span className='truncate text-xs'>{user.email}</span>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-xl border-0 bg-white/95 shadow-lg backdrop-blur-sm dark:bg-gray-900/95'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={8}
          >
            {/* Header del usuario */}
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='p-4 text-left'>
                <div className='grid min-w-0 flex-1 gap-1 text-left text-sm leading-tight'>
                  <span className='break-words text-base font-semibold leading-tight text-gray-900 dark:text-gray-100'>
                    {user.name}
                  </span>
                  <span className='truncate text-sm text-gray-600 dark:text-gray-400'>
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className='mx-4 bg-gray-200 dark:bg-gray-700' />

            {/* Opciones del menú */}
            <div className='p-2'>
              <DropdownMenuItem className='flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-800 dark:focus:bg-gray-800'>
                <Sparkles className='h-4 w-4 text-gray-600 dark:text-gray-400' />
                <span className='text-sm font-medium'>Upgrade to Pro</span>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className='mx-4 bg-gray-200 dark:bg-gray-700' />

            <div className='p-2'>
              <DropdownMenuItem className='flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-800 dark:focus:bg-gray-800'>
                <BadgeCheck className='h-4 w-4 text-gray-600 dark:text-gray-400' />
                <span className='text-sm font-medium'>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem className='flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-800 dark:focus:bg-gray-800'>
                <CreditCard className='h-4 w-4 text-gray-600 dark:text-gray-400' />
                <span className='text-sm font-medium'>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem className='flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-800 dark:focus:bg-gray-800'>
                <Bell className='h-4 w-4 text-gray-600 dark:text-gray-400' />
                <span className='text-sm font-medium'>Notifications</span>
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className='mx-4 bg-gray-200 dark:bg-gray-700' />

            {/* Cerrar sesión */}
            <div className='p-2'>
              <DropdownMenuItem className='flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300 dark:focus:bg-red-950/30'>
                <LogOut className='h-4 w-4' />
                <span className='text-sm font-medium'>Log out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
