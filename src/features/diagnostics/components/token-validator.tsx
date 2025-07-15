'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToken } from '@/features/auth/TokenContext';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Interfaz para el token JWT decodificado
interface JwtPayload {
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  [key: string]: any;
}

interface TokenValidatorProps {
  minimal?: boolean;
}

export function TokenValidator({ minimal = false }: TokenValidatorProps) {
  const { accessToken } = useToken();
  const [tokenData, setTokenData] = useState<JwtPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isExpired, setIsExpired] = useState<boolean | null>(null);

  const parseJwt = (token: string): JwtPayload | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const checkTokenValidity = (decodedToken: JwtPayload | null): boolean => {
    if (!decodedToken) return false;

    // Verifica que el token tenga los campos básicos necesarios
    return !!(decodedToken.iss && decodedToken.aud && decodedToken.exp);
  };

  const checkTokenExpiration = (decodedToken: JwtPayload | null): boolean => {
    if (!decodedToken) return true; // Si no hay token, consideramos que está expirado

    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
  };

  const analyzeToken = useCallback(() => {
    setIsLoading(true);
    setError(null);

    if (!accessToken) {
      setError('No hay token de acceso disponible');
      setTokenData(null);
      setIsValid(false);
      setIsExpired(null);
      setIsLoading(false);
      return;
    }

    try {
      const decodedToken = parseJwt(accessToken);
      setTokenData(decodedToken);
      setIsValid(checkTokenValidity(decodedToken));
      setIsExpired(checkTokenExpiration(decodedToken));
    } catch (err) {
      setError(
        `Error al decodificar el token: ${err instanceof Error ? err.message : String(err)}`
      );
      setTokenData(null);
      setIsValid(false);
      setIsExpired(null);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Analizar automáticamente cuando se carga el componente
  useEffect(() => {
    if (accessToken) {
      analyzeToken();
    }
  }, [accessToken, analyzeToken]);

  if (minimal) {
    return (
      <div className='flex items-center space-x-2'>
        {isValid === null ? (
          <AlertCircle className='h-4 w-4 text-gray-400' />
        ) : isValid && !isExpired ? (
          <CheckCircle className='h-4 w-4 text-green-500' />
        ) : (
          <XCircle className='h-4 w-4 text-red-500' />
        )}
        <span className='text-sm'>
          {isValid === null
            ? 'Sin verificar'
            : isValid && !isExpired
              ? 'Token válido'
              : isExpired
                ? 'Token expirado'
                : 'Token inválido'}
        </span>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex space-x-2'>
        <Button onClick={analyzeToken} disabled={isLoading || !accessToken}>
          {isLoading ? 'Analizando...' : 'Verificar Token'}
        </Button>
      </div>

      {error && (
        <div className='rounded border border-red-300 bg-red-100 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'>
          {error}
        </div>
      )}

      {isValid !== null && (
        <div
          className={`rounded border p-4 ${
            isValid && !isExpired
              ? 'border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
              : 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
          }`}
        >
          <div className='mb-4 flex items-center space-x-3'>
            {isValid && !isExpired ? (
              <>
                <CheckCircle className='h-6 w-6 text-green-500 dark:text-green-400' />
                <h4 className='font-medium text-green-700 dark:text-green-300'>
                  Token Válido
                </h4>
              </>
            ) : isExpired ? (
              <>
                <XCircle className='h-6 w-6 text-red-500 dark:text-red-400' />
                <h4 className='font-medium text-red-700 dark:text-red-300'>
                  Token Expirado
                </h4>
              </>
            ) : (
              <>
                <XCircle className='h-6 w-6 text-red-500 dark:text-red-400' />
                <h4 className='font-medium text-red-700 dark:text-red-300'>
                  Token Inválido
                </h4>
              </>
            )}
          </div>

          {tokenData && (
            <div className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm text-black dark:text-white'>
              <dt className='font-medium'>Emisor:</dt>
              <dd>{tokenData.iss}</dd>

              <dt className='font-medium'>Audiencia:</dt>
              <dd>{tokenData.aud}</dd>

              <dt className='font-medium'>Expira:</dt>
              <dd
                className={
                  isExpired ? 'font-medium text-red-600 dark:text-red-400' : ''
                }
              >
                {new Date(tokenData.exp * 1000).toLocaleString()}
                {isExpired && ' (Expirado)'}
              </dd>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
