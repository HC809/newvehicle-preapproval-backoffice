'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSession } from 'next-auth/react';
import { toast } from 'sonner';

function parseJwt(token: string) {
  try {
    // Decodificar el payload del token (segunda parte)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
}

export function TokenValidator() {
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{
    token: string;
    decoded: any;
    isValid: boolean;
    expiresIn?: string;
    userId?: string;
    role?: string;
  } | null>(null);

  const validateToken = async () => {
    setLoading(true);

    try {
      // Obtener el token desde la sesión
      const session = await getSession();
      if (!session?.accessToken) {
        toast.error('No hay token de acceso disponible');
        return;
      }

      const token = String(session.accessToken);

      // Decodificar el token
      const decoded = parseJwt(token);

      if (!decoded) {
        setTokenInfo({
          token: token.substring(0, 15) + '...',
          decoded: null,
          isValid: false
        });
        toast.error('No se pudo decodificar el token JWT');
        return;
      }

      // Verificar si el token ha expirado
      const expirationTime = decoded.exp * 1000; // exp está en segundos, convertir a milisegundos
      const currentTime = Date.now();
      const isValid = expirationTime > currentTime;

      // Calcular tiempo restante
      const timeRemaining = expirationTime - currentTime;
      const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutesRemaining = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );

      setTokenInfo({
        token: token.substring(0, 15) + '...',
        decoded,
        isValid,
        expiresIn: isValid
          ? `${hoursRemaining}h ${minutesRemaining}m`
          : 'Expirado',
        userId: decoded.UserId || decoded.sub,
        role:
          decoded.role ||
          decoded[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ]
      });

      if (isValid) {
        toast.success('Token JWT válido');
      } else {
        toast.error('Token JWT expirado');
      }
    } catch (error) {
      console.error('Error validating token:', error);
      toast.error(
        'Error al validar el token: ' +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='mb-4'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-md'>Validador de Token JWT</CardTitle>
        <CardDescription>
          Verifica el estado del token de acceso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {tokenInfo && (
            <>
              <div className='flex items-center justify-between'>
                <span className='font-semibold'>Estado:</span>
                <Badge
                  className={
                    tokenInfo.isValid
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }
                >
                  {tokenInfo.isValid ? 'Válido' : 'Inválido'}
                </Badge>
              </div>

              {tokenInfo.expiresIn && (
                <div className='flex items-center justify-between'>
                  <span className='font-semibold'>Expira en:</span>
                  <span>{tokenInfo.expiresIn}</span>
                </div>
              )}

              {tokenInfo.userId && (
                <div className='flex items-center justify-between'>
                  <span className='font-semibold'>User ID:</span>
                  <span
                    className='max-w-[200px] truncate font-mono text-xs'
                    title={tokenInfo.userId}
                  >
                    {tokenInfo.userId}
                  </span>
                </div>
              )}

              {tokenInfo.role && (
                <div className='flex items-center justify-between'>
                  <span className='font-semibold'>Rol:</span>
                  <span>{tokenInfo.role}</span>
                </div>
              )}

              <div className='flex items-center justify-between'>
                <span className='font-semibold'>Token:</span>
                <span
                  className='max-w-[200px] truncate font-mono text-xs'
                  title={tokenInfo.token}
                >
                  {tokenInfo.token}
                </span>
              </div>
            </>
          )}

          <Button
            onClick={validateToken}
            disabled={loading}
            variant='outline'
            size='sm'
            className='mt-2 w-full'
          >
            {loading && <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />}
            {loading ? 'Validando...' : 'Validar Token'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
