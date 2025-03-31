'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
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
  const [statusMessage, setStatusMessage] = useState<string>('Sin verificar');
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

  // Verificar conexión al cargar el componente
  useEffect(() => {
    if (apiClient) {
      testApiConnection();
    }
  }, [apiClient]);

  if (minimal) {
    return (
      <div className='flex items-center space-x-2'>
        {status === 'idle' ? (
          <Clock className='h-4 w-4 text-gray-400' />
        ) : status === 'success' ? (
          <CheckCircle className='h-4 w-4 text-green-500' />
        ) : (
          <XCircle className='h-4 w-4 text-red-500' />
        )}
        <span className='text-sm'>
          {status === 'idle' ? 'Sin verificar' : statusMessage}
        </span>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div
        className={`rounded border p-4 ${
          status === 'success'
            ? 'border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
            : status === 'error'
              ? 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
              : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/30 dark:text-gray-300'
        }`}
      >
        <div className='mb-4 flex items-center space-x-3'>
          {status === 'success' ? (
            <>
              <CheckCircle className='h-6 w-6 text-green-500 dark:text-green-400' />
              <h4 className='font-medium text-green-700 dark:text-green-300'>
                {statusMessage}
              </h4>
            </>
          ) : status === 'error' ? (
            <>
              <XCircle className='h-6 w-6 text-red-500 dark:text-red-400' />
              <h4 className='font-medium text-red-700 dark:text-red-300'>
                {statusMessage}
              </h4>
            </>
          ) : (
            <>
              <Clock className='h-6 w-6 text-gray-500 dark:text-gray-400' />
              <h4 className='font-medium text-gray-700 dark:text-gray-300'>
                {statusMessage}
              </h4>
            </>
          )}
        </div>

        {responseTime !== null && (
          <div className='flex items-center space-x-3 text-sm text-black dark:text-white'>
            <Clock className='h-4 w-4 text-gray-500 dark:text-gray-400' />
            <span className='font-medium'>Tiempo de respuesta:</span>
            <span
              className={
                responseTime > 1000
                  ? 'font-medium text-amber-600 dark:text-amber-400'
                  : 'font-medium text-green-600 dark:text-green-400'
              }
            >
              {responseTime} ms
            </span>
          </div>
        )}
      </div>

      <Button
        className='w-full'
        onClick={testApiConnection}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Verificando...' : 'Verificar Conexión'}
      </Button>
    </div>
  );
}
