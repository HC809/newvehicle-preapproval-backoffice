'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from 'next-auth/react';

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

export function UserNav() {
  const { data: session, status } = useSession();

  // Mostrar loading mientras se verifica la sesión
  if (status === 'loading') {
    return (
      <Button
        variant='ghost'
        className='relative h-9 w-9 rounded-full shadow-sm ring-2 ring-yellow-500 dark:ring-[#F7E605]'
        disabled
      >
        <Avatar className='h-9 w-9'>
          <AvatarFallback className='rounded-full bg-[#013B7C] font-semibold text-white dark:bg-blue-600'>
            ...
          </AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  // Solo mostrar el menú si hay una sesión válida
  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='relative h-9 w-9 rounded-full shadow-sm ring-2 ring-yellow-500 transition-all duration-200 hover:bg-gray-100 dark:ring-[#F7E605] dark:hover:bg-gray-800'
          >
            <Avatar className='h-9 w-9'>
              <AvatarImage
                src={session.user?.image ?? ''}
                alt={session.user?.name ?? ''}
              />
              <AvatarFallback className='rounded-full bg-[#013B7C] font-semibold text-white dark:bg-blue-600'>
                {getInitials(session.user?.name || '')}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-64 rounded-xl border-0 bg-white/95 shadow-lg backdrop-blur-sm dark:bg-gray-900/95'
          align='end'
          forceMount
          sideOffset={8}
        >
          {/* Header del usuario */}
          <DropdownMenuLabel className='font-normal'>
            <div className='p-4 text-left'>
              <div className='grid min-w-0 flex-1 gap-1 text-left text-sm leading-tight'>
                <span className='break-words text-base font-semibold leading-tight text-gray-900 dark:text-gray-100'>
                  {session.user?.name}
                </span>
                <span className='truncate text-sm text-gray-600 dark:text-gray-400'>
                  {session.user?.email}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className='mx-4 bg-gray-200 dark:bg-gray-700' />

          {/* Opciones del menú - Comentadas por el momento */}
          {/* <div className='p-2'>
            <DropdownMenuItem className='flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800'>
              <span className='text-sm font-medium'>Perfil</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className='flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800'>
              <span className='text-sm font-medium'>Configuración</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator className='mx-4 bg-gray-200 dark:bg-gray-700' /> */}

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
              <span className='text-sm font-medium'>Cerrar sesión</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Si no hay sesión, no mostrar nada
  return null;
}
