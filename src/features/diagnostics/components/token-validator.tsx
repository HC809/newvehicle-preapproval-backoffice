'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToken } from '@/features/auth/TokenContext';

// Interfaz para el token JWT decodificado
interface JwtPayload {
  sub: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  role: string | string[];
  name: string;
  email: string;
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

  const analyzeToken = () => {
    setIsLoading(true);
    setError(null);

    if (!accessToken) {
      setError('No access token available');
      setTokenData(null);
      setIsLoading(false);
      return;
    }

    try {
      const decodedToken = parseJwt(accessToken);
      setTokenData(decodedToken);
    } catch (err) {
      setError(
        `Failed to decode token: ${err instanceof Error ? err.message : String(err)}`
      );
      setTokenData(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (minimal) {
    return (
      <div className='flex items-center justify-between'>
        <div className='space-y-0.5'>
          <p className='text-sm font-medium'>Estado del Token</p>
          <p className='text-xs text-muted-foreground'>
            {tokenData
              ? 'Token válido'
              : error
                ? 'Token inválido'
                : 'No verificado'}
          </p>
        </div>
        <div
          className={`h-3 w-3 rounded-full ${
            tokenData ? 'bg-green-500' : error ? 'bg-red-500' : 'bg-gray-300'
          }`}
        />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex space-x-2'>
        <Button onClick={analyzeToken} disabled={isLoading || !accessToken}>
          {isLoading ? 'Analizando...' : 'Analizar Token'}
        </Button>
      </div>

      {error && (
        <div className='rounded border border-red-300 bg-red-100 p-3 text-sm text-red-900'>
          {error}
        </div>
      )}

      {tokenData && (
        <div className='max-h-80 overflow-auto rounded border border-slate-200 bg-slate-50 p-4'>
          <h4 className='mb-2 font-medium'>Información del Token</h4>
          <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm'>
            <dt className='font-medium'>Subject:</dt>
            <dd>{tokenData.sub}</dd>

            <dt className='font-medium'>Emisor:</dt>
            <dd>{tokenData.iss}</dd>

            <dt className='font-medium'>Audiencia:</dt>
            <dd>{tokenData.aud}</dd>

            <dt className='font-medium'>Emitido:</dt>
            <dd>{new Date(tokenData.iat * 1000).toLocaleString()}</dd>

            <dt className='font-medium'>Expira:</dt>
            <dd>{new Date(tokenData.exp * 1000).toLocaleString()}</dd>

            <dt className='font-medium'>Roles:</dt>
            <dd>
              {Array.isArray(tokenData.role)
                ? tokenData.role.join(', ')
                : tokenData.role}
            </dd>

            <dt className='font-medium'>Nombre:</dt>
            <dd>{tokenData.name}</dd>

            <dt className='font-medium'>Email:</dt>
            <dd>{tokenData.email}</dd>
          </dl>
        </div>
      )}
    </div>
  );
}
