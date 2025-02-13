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
}

const TokenContext = createContext<TokenContextProps>({ accessToken: null });

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { data: session, status } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (status === 'authenticated' && session?.accessToken) {
      setAccessToken(session.accessToken as string);

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
    }

    return () => clearTimeout(timeoutId);
  }, [session, status]);

  const handleDialogClose = async () => {
    setIsDialogOpen(false);
    await signOut();
  };

  return (
    <TokenContext.Provider value={{ accessToken }}>
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
