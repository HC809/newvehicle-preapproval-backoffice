'use client';
import { adminNavItems, navItems } from '@/constants/data';
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch
} from 'kbar';
import { useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import RenderResults from './render-result';
import useThemeSwitching from './use-theme-switching';
import { useSession } from 'next-auth/react';

// Agregar este tipo
type CustomActions = {
  openUserForm?: () => void;
  handleLogout?: () => void;
  openDealershipForm?: () => void; // Add this line
};

export default function KBar({
  children,
  actions: customActions
}: {
  children: React.ReactNode;
  actions?: CustomActions;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const navigateTo = useCallback(
    (url: string) => {
      router.push(url);
    },
    [router]
  );

  const userNavItems = useMemo(() => {
    return session?.isSystemAdmin ? adminNavItems : navItems;
  }, [session]);

  const actions = useMemo(
    () => [
      // Add dealership form action
      ...(customActions?.openDealershipForm
        ? [
            {
              id: 'addDealership',
              name: 'Agregar Concesionaria',
              shortcut: ['a', 'g'],
              keywords: 'nueva concesionaria agregar crear add dealership',
              section: 'Concesionarias',
              subtitle: 'Crear nueva concesionaria',
              perform: customActions.openDealershipForm
            }
          ]
        : []),
      // Agregar acciones personalizadas
      ...(customActions?.openUserForm
        ? [
            {
              id: 'addUser',
              name: 'Agregar Usuario',
              shortcut: ['a', 'g'],
              keywords: 'nuevo usuario agregar crear add',
              section: 'Usuarios',
              subtitle: 'Crear nuevo usuario', // Texto en español
              perform: customActions.openUserForm
            }
          ]
        : []),
      ...(customActions?.handleLogout
        ? [
            {
              id: 'logout',
              name: 'Cerrar Sesión',
              shortcut: ['ctrl', 'q'], // Cambiado a ctrl + q
              keywords: 'logout salir exit',
              section: 'Sistema',
              perform: customActions.handleLogout
            }
          ]
        : []),
      // Mantener las acciones de navegación 'GENERAL' existentes
      ...userNavItems.flatMap((navItem) => {
        // Only include base action if the navItem has a real URL and is not just a container
        const baseAction =
          navItem.url !== '#'
            ? {
                id: `${navItem.title.toLowerCase()}Action`,
                name: navItem.title,
                shortcut: navItem.shortcut,
                keywords: navItem.title.toLowerCase(),
                section: 'Navegación', // Cambiado de 'Navigation' a 'Navegación'
                subtitle: `Ir a ${navItem.title}`, // Cambiado de 'Go to' a 'Ir a'
                perform: () => navigateTo(navItem.url)
              }
            : null;

        // Map child items into actions
        const childActions =
          navItem.items?.map((childItem) => ({
            id: `${childItem.title.toLowerCase()}Action`,
            name: childItem.title,
            shortcut: childItem.shortcut,
            keywords: childItem.title.toLowerCase(),
            section: navItem.title,
            subtitle: `Go to ${childItem.title}`,
            perform: () => navigateTo(childItem.url)
          })) ?? [];

        // Return only valid actions (ignoring null base actions for containers)
        return baseAction ? [baseAction, ...childActions] : childActions;
      })
    ],
    [navigateTo, customActions, userNavItems]
  );

  return (
    <KBarProvider actions={actions}>
      <KBarComponent>{children}</KBarComponent>
    </KBarProvider>
  );
}
const KBarComponent = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitching();

  return (
    <>
      <KBarPortal>
        <KBarPositioner className='scrollbar-hide fixed inset-0 z-[99999] bg-black/80 !p-0 backdrop-blur-sm'>
          <KBarAnimator className='relative !mt-64 w-full max-w-[600px] !-translate-y-12 overflow-hidden rounded-lg border bg-background text-foreground shadow-lg'>
            <div className='bg-background'>
              <div className='border-x-0 border-b-2'>
                <KBarSearch
                  className='w-full border-none bg-background px-6 py-4 text-lg outline-none focus:outline-none focus:ring-0 focus:ring-offset-0'
                  defaultPlaceholder='Escribe un comando o busca...' // Añadir defaultPlaceholder
                  placeholder='Escribe un comando o busca...' // Añadir placeholder en español
                />
              </div>
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
