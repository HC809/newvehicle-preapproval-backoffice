'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction
} from '@/components/ui/alert-dialog';

interface TokenContextProps {
  accessToken: string | null;
  userId: string | null;
  userRoles: string[];
  userRole: string | null;
  username: string | null;
  hasRole: (role: string) => boolean;
}

const TokenContext = createContext<TokenContextProps>({
  accessToken: null,
  userId: null,
  userRoles: [],
  userRole: null,
  username: null,
  hasRole: () => false
});

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { data: session, status } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (status === 'authenticated' && session) {
      // Establecer el token de acceso
      const token = session.accessToken as string | undefined;
      if (token) {
        setAccessToken(token);
      }

      // Establecer el ID de usuario si está disponible
      if (session.user) {
        setUserId(session.user.id || null);
      }

      // Obtener el rol de la sesión
      const sessionRole = (session as any).role;
      console.log('Rol obtenido de la sesión:', sessionRole);

      // Establecer el rol como string - no como array
      setUserRole(sessionRole || null);

      // Mantener userRoles por compatibilidad
      setUserRoles(sessionRole ? [sessionRole] : []);

      // Establecer el nombre de usuario
      setUsername(session.user?.name || null);

      // Manejar la expiración del token
      const expiresAt = new Date(session.expires);
      const now = new Date();
      const timeUntilExpiration = expiresAt.getTime() - now.getTime();

      if (timeUntilExpiration > 0) {
        timeoutId = setTimeout(async () => {
          setIsDialogOpen(true);
        }, timeUntilExpiration);
      } else {
        setIsDialogOpen(true);
      }
    } else if (status === 'unauthenticated') {
      setAccessToken(null);
      setUserId(null);
      setUserRoles([]);
      setUserRole(null);
      setUsername(null);
    }

    return () => clearTimeout(timeoutId);
  }, [session, status]);

  const handleDialogClose = async () => {
    setIsDialogOpen(false);
    await signOut();
  };

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (role: string) => {
    console.log(`Verificando si el usuario tiene el rol '${role}'`, userRole);

    // Si no hay rol, devolver false
    if (!userRole) {
      console.log('No hay rol definido, retornando false');
      return false;
    }

    // Verificar si el rol coincide exactamente
    const hasExactRole = userRole === role;

    if (hasExactRole) {
      console.log(`Rol '${role}' encontrado`);
      return true;
    }

    console.log(`Rol '${role}' no encontrado`);
    return false;
  };

  return (
    <TokenContext.Provider
      value={{ accessToken, userId, userRoles, userRole, username, hasRole }}
    >
      {children}
      <AlertDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleDialogClose();
          }
          setIsDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sesión Expirada</AlertDialogTitle>
            <AlertDialogDescription>
              Tu sesión ha expirado. Por favor, inicia sesión nuevamente para
              continuar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleDialogClose}>
              Ok
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TokenContext.Provider>
  );
};

export const useToken = () => useContext(TokenContext);
