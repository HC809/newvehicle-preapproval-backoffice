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

export function UserNav() {
  const { data: session, status } = useSession();

  // Mostrar loading mientras se verifica la sesión
  if (status === 'loading') {
    return (
      <Button
        variant='ghost'
        className='relative h-8 w-8 rounded-full'
        disabled
      >
        <Avatar className='h-8 w-8'>
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  // Solo mostrar el menú si hay una sesión válida
  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <Avatar className='h-8 w-8'>
              <AvatarImage
                src={session.user?.image ?? ''}
                alt={session.user?.name ?? ''}
              />
              <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm font-medium leading-none'>
                {session.user?.name}
              </p>
              <p className='text-xs leading-none text-muted-foreground'>
                {session.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                // TODO: Implementar navegación al perfil
                console.log('Navegar al perfil');
              }}
            >
              Perfil
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // TODO: Implementar navegación a configuración
                console.log('Navegar a configuración');
              }}
            >
              Configuración
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup> */}
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuItem
            onClick={async () => {
              try {
                await signOut({
                  callbackUrl: '/auth/signin',
                  redirect: true
                });
              } catch (error) {
                console.error('Error al cerrar sesión:', error);
                // Fallback: redirigir manualmente
                window.location.href = '/auth/signin';
              }
            }}
          >
            Cerrar sesión
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Si no hay sesión, no mostrar nada
  return null;
}
