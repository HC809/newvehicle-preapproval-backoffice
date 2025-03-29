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
import { toast } from 'sonner';

export function ApiConnectivityTest() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [responseTime, setResponseTime] = useState<number | null>(null);

  // API URL desde las variables de entorno
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const testApi = async () => {
    setLoading(true);
    setStatus('idle');
    setResponseTime(null);

    try {
      // Registrar el tiempo de inicio
      const startTime = performance.now();

      // Intenta hacer una petición al endpoint de health check o un endpoint simple
      const healthEndpoint = `${apiUrl}/api/auth`;
      console.log(`Testing API connection to: ${healthEndpoint}`);

      const response = await fetch(healthEndpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        },
        // Configuración para el timeout
        signal: AbortSignal.timeout(5000)
      });

      // Calcular el tiempo de respuesta
      const endTime = performance.now();
      const timeElapsed = Math.round(endTime - startTime);
      setResponseTime(timeElapsed);

      if (response.ok) {
        setStatus('success');
        toast.success(`Conexión exitosa: ${timeElapsed}ms`);
      } else {
        setStatus('error');
        toast.error(`Error de conexión: Código HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error al verificar la API:', error);
      setStatus('error');
      toast.error(
        error instanceof Error ? error.message : 'No se pudo conectar a la API'
      );
    } finally {
      setLoading(false);
    }
  };

  // Determinar el color del badge según el estado
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Determinar el texto del badge según el estado
  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Conectado';
      case 'error':
        return 'Error';
      default:
        return 'No verificado';
    }
  };

  return (
    <Card className='mb-4'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-md'>Prueba de Conectividad API</CardTitle>
        <CardDescription>Verifica la conexión con la API</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='font-semibold'>Estado:</span>
            <Badge className={getStatusColor()}>{getStatusText()}</Badge>
          </div>

          {responseTime !== null && (
            <div className='flex items-center justify-between'>
              <span className='font-semibold'>Tiempo de respuesta:</span>
              <span className='font-mono text-sm'>{responseTime}ms</span>
            </div>
          )}

          <div className='flex items-center justify-between'>
            <span className='font-semibold'>API URL:</span>
            <span
              className='max-w-[200px] truncate font-mono text-sm'
              title={apiUrl}
            >
              {apiUrl || 'No definida'}
            </span>
          </div>

          <Button
            onClick={testApi}
            disabled={loading}
            variant='outline'
            size='sm'
            className='mt-2 w-full'
          >
            {loading && <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />}
            {loading ? 'Verificando...' : 'Verificar conexión'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
