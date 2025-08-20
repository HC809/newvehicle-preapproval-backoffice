'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import {
  // Bell,
  ChevronRight,
  ChevronsUpDown,
  LogOut
  // User,
  // Settings,
  // Shield
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import * as React from 'react';
import { Icons } from '../icons';
import { useTheme } from 'next-themes';
import { navItems } from '@/constants/data';
import { FilteredNav } from './filtered-nav';
import { translateRole } from '@/utils/translateRole';

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

export default function AppSidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Efecto para manejar el montaje del cliente
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navigationItems = navItems;

  const logos = {
    light: {
      main: '/images/logo.png'
    },
    dark: {
      main: '/images/logo-dark.png'
    }
  };

  const logoSrc =
    mounted && resolvedTheme === 'dark' ? logos.dark.main : logos.light.main;

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <div className='flex justify-center py-4'>
          <div className='h-10 w-48'>
            <Image
              src={logoSrc}
              alt='COFISA'
              width={192}
              height={40}
              className='h-full w-full object-contain'
              priority
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarMenu>
            <FilteredNav items={navigationItems}>
              {(filteredItems) =>
                filteredItems.map((item) => {
                  const Icon = item.icon ? Icons[item.icon] : Icons.logo;
                  const isActive = pathname === item.url;
                  const hasActiveChild = item.items?.some(
                    (subItem) => pathname === subItem.url
                  );

                  return item?.items && item?.items?.length > 0 ? (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={item.isActive || hasActiveChild}
                      className='group/collapsible'
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={isActive || hasActiveChild}
                            className={`transition-all duration-200 ${
                              isActive || hasActiveChild
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                                : 'hover:bg-sidebar-accent/50'
                            }`}
                          >
                            {item.icon && <Icon />}
                            <span>{item.title}</span>
                            <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => {
                              const isSubActive = pathname === subItem.url;
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubActive}
                                    className={`transition-all duration-200 ${
                                      isSubActive
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                                        : 'hover:bg-sidebar-accent/50'
                                    }`}
                                  >
                                    <Link href={subItem.url}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={isActive}
                        className={`transition-all duration-200 ${
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                            : 'hover:bg-sidebar-accent/50'
                        }`}
                      >
                        <Link href={item.url}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              }
            </FilteredNav>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Mostrar loading mientras se verifica la sesión */}
            {status === 'loading' ? (
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                disabled
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarFallback className='rounded-lg'>...</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>Cargando...</span>
                  <span className='truncate text-xs'>Verificando sesión</span>
                </div>
                <ChevronsUpDown className='ml-auto size-4' />
              </SidebarMenuButton>
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size='lg'
                    className='min-h-[4.5rem] rounded-lg py-3 transition-all duration-200 hover:bg-sidebar-accent/80 hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                  >
                    <Avatar className='h-8 w-8 rounded-full shadow-sm ring-2 ring-yellow-500 dark:ring-[#F7E605]'>
                      <AvatarImage
                        src={session.user.image || ''}
                        alt={session.user.name || ''}
                      />
                      <AvatarFallback className='rounded-full bg-[#013B7C] font-semibold text-white dark:bg-blue-600'>
                        {getInitials(session.user.name || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 justify-center gap-1.5 text-left text-sm leading-tight'>
                      <span className='truncate font-semibold'>
                        {getShortName(session.user.name || '')}
                      </span>
                      <span className='truncate text-xs'>
                        {session.user.email || ''}
                      </span>
                      <span className='truncate text-xs text-sidebar-accent-foreground/70'>
                        {translateRole[
                          session.user.role as keyof typeof translateRole
                        ] ||
                          session.user.role ||
                          ''}
                      </span>
                    </div>
                    <ChevronsUpDown className='ml-auto size-4' />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-xl border-0 bg-white/95 shadow-lg backdrop-blur-sm dark:bg-gray-900/95'
                  side='bottom'
                  align='end'
                  sideOffset={8}
                >
                  {/* Header del usuario */}
                  <DropdownMenuLabel className='p-0 font-normal'>
                    <div className='p-4 text-left'>
                      <div className='grid min-w-0 flex-1 gap-1 text-left text-sm leading-tight'>
                        <span className='break-words text-base font-semibold leading-tight text-gray-900 dark:text-gray-100'>
                          {session?.user?.name || ''}
                        </span>
                        <span className='truncate text-sm text-gray-600 dark:text-gray-400'>
                          {session?.user?.email || ''}
                        </span>
                        <span className='truncate text-sm font-medium text-gray-500 dark:text-gray-400'>
                          {translateRole[
                            session?.user?.role as keyof typeof translateRole
                          ] ||
                            session?.user?.role ||
                            ''}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className='mx-4 bg-gray-200 dark:bg-gray-700' />

                  {/* Opciones del menú - Comentadas por el momento */}
                  {/* <div className='p-2'>
                    <DropdownMenuItem className='flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800'>
                      <User className='h-4 w-4 text-gray-600 dark:text-gray-400' />
                      <span className='text-sm font-medium'>Mi Perfil</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className='flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800'>
                      <Settings className='h-4 w-4 text-gray-600 dark:text-gray-400' />
                      <span className='text-sm font-medium'>Configuración</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem className='flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800'>
                      <Shield className='h-4 w-4 text-gray-600 dark:text-gray-400' />
                      <span className='text-sm font-medium'>Seguridad</span>
                    </DropdownMenuItem>
                  </div> */}

                  {/* <DropdownMenuSeparator className='mx-4 bg-gray-200 dark:bg-gray-700' /> */}

                  {/* Cerrar sesión */}
                  <div className='p-2'>
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await signOut({
                            callbackUrl: '/auth/signin',
                            redirect: true
                          });
                        } catch (error) {
                          // Fallback: redirigir manualmente
                          window.location.href = '/auth/signin';
                        }
                      }}
                      className='flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300 dark:focus:bg-red-950/30'
                    >
                      <LogOut className='h-4 w-4' />
                      <span className='text-sm font-medium'>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
