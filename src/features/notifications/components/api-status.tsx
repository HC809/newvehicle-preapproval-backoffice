'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import useAxios from '@/hooks/use-axios';

interface ApiConnectivityTestProps {
  minimal?: boolean;
}

export function ApiConnectivityTest({
  minimal = false
}: ApiConnectivityTestProps) {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [statusMessage, setStatusMessage] = useState<string>('No verificado');
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const apiClient = useAxios();

  const testApiConnection = async () => {
    if (!apiClient) {
      setStatus('error');
      setStatusMessage('Cliente API no inicializado');
      return;
    }

    try {
      setStatus('loading');
      setStatusMessage('Verificando conexión...');
      setResponseTime(null);

      const startTime = performance.now();
      const response = await apiClient.get('/test/public', {
        timeout: 5000
      });
      const endTime = performance.now();

      // Calcular tiempo de respuesta redondeado a 2 decimales
      const time = Math.round((endTime - startTime) * 100) / 100;
      setResponseTime(time);

      if (response.status >= 200 && response.status < 300) {
        setStatus('success');
        setStatusMessage(`Conectado (${response.status})`);
      } else {
        setStatus('error');
        setStatusMessage(`Error: ${response.status}`);
      }
    } catch (error) {
      setStatus('error');
      setStatusMessage(
        error instanceof Error ? `Error: ${error.message}` : 'Error desconocido'
      );
    }
  };

  if (minimal) {
    return (
      <div className='flex items-center justify-between'>
        <div className='space-y-0.5'>
          <p className='text-sm font-medium'>Estado del API</p>
          <p className='text-xs text-muted-foreground'>{statusMessage}</p>
        </div>
        <div
          className={`h-3 w-3 rounded-full ${
            status === 'success'
              ? 'bg-green-500'
              : status === 'error'
                ? 'bg-red-500'
                : status === 'loading'
                  ? 'bg-yellow-500'
                  : 'bg-gray-300'
          }`}
        ></div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='space-y-0.5'>
          <p className='text-sm font-medium'>Estado del API</p>
          <p className='text-xs text-muted-foreground'>{statusMessage}</p>
        </div>
        <div
          className={`h-3 w-3 rounded-full ${
            status === 'success'
              ? 'bg-green-500'
              : status === 'error'
                ? 'bg-red-500'
                : status === 'loading'
                  ? 'bg-yellow-500'
                  : 'bg-gray-300'
          }`}
        ></div>
      </div>

      {responseTime !== null && (
        <div className='flex items-center justify-between'>
          <p className='text-sm font-medium'>Tiempo de respuesta:</p>
          <p className='text-sm'>{responseTime} ms</p>
        </div>
      )}

      <Button
        variant='outline'
        size='sm'
        className='w-full'
        onClick={testApiConnection}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Verificando...' : 'Verificar Conexión'}
      </Button>
    </div>
  );
}
