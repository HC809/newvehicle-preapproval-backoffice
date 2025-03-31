'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowDownUp, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getSession } from 'next-auth/react';

interface HttpTesterProps {
  minimal?: boolean;
}

export function HttpTester({ minimal = false }: HttpTesterProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [response, setResponse] = useState<any>(null);
  const [lastTestedAt, setLastTestedAt] = useState<Date | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toISOString().substring(11, 19)}: ${message}`
    ]);
  };

  // API URL desde las variables de entorno
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const testDirectHttp = async () => {
    setLoading(true);
    setStatus('idle');
    setLogs([]);
    setResponse(null);
    setResponseTime(null);

    try {
      // Obtener el token de acceso
      const session = await getSession();
      if (!session?.accessToken) {
        setStatus('error');
        addLog('Error: No hay token de acceso disponible');
        toast.error('No hay token de acceso disponible');
        setLoading(false);
        return;
      }

      // Construir la URL para ping simple a la API
      const testUrl = `${apiUrl}/api/notifications/ping`;
      addLog(`Enviando solicitud HTTP a: ${testUrl}`);

      const token = String(session.accessToken);

      // Medir tiempo de respuesta
      const startTime = performance.now();

      // Realizar la solicitud HTTP
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        // Tiempo máximo de espera de 5 segundos
        signal: AbortSignal.timeout(5000)
      });

      // Calcular tiempo de respuesta
      const endTime = performance.now();
      const time = Math.round((endTime - startTime) * 100) / 100;
      setResponseTime(time);

      const statusText = `${response.status} ${response.statusText}`;
      addLog(`Respuesta HTTP: ${statusText}`);

      if (response.ok) {
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
          setResponse(data);
          addLog(`Datos recibidos: ${JSON.stringify(data)}`);
        } else {
          const text = await response.text();
          setResponse({ text });
          addLog(`Respuesta (texto): ${text}`);
        }

        setStatus('success');
        toast.success(`Conexión HTTP exitosa: ${statusText}`);
      } else {
        addLog(`Error en HTTP: Estado ${statusText}`);
        try {
          const errorText = await response.text();
          addLog(`Detalle del error: ${errorText}`);
          setResponse({ error: errorText });
        } catch {
          addLog('No se pudo obtener el detalle del error');
        }
        setStatus('error');
        toast.error(`Error HTTP: ${statusText}`);
      }
    } catch (error) {
      setStatus('error');
      addLog(
        `Error de conexión: ${error instanceof Error ? error.message : String(error)}`
      );
      toast.error('Error de conexión HTTP');

      // Sugerencias de solución
      addLog('Posibles causas:');
      addLog('1. La API no está ejecutándose o accesible');
      addLog('2. Problemas con CORS en el servidor');
      addLog('3. La ruta de la API es incorrecta');
      addLog('4. El token de autenticación es inválido');
    } finally {
      setLoading(false);
      setLastTestedAt(new Date());
    }
  };

  const getStatusIcon = () => {
    if (status === 'success') {
      return (
        <CheckCircle
          className={
            minimal ? 'h-4 w-4 text-green-500' : 'h-6 w-6 text-green-500'
          }
        />
      );
    } else if (status === 'error') {
      return (
        <XCircle
          className={minimal ? 'h-4 w-4 text-red-500' : 'h-6 w-6 text-red-500'}
        />
      );
    } else {
      return (
        <ArrowDownUp
          className={
            minimal ? 'h-4 w-4 text-gray-400' : 'h-6 w-6 text-gray-500'
          }
        />
      );
    }
  };

  if (minimal) {
    return (
      <div className='flex items-center space-x-2'>
        {getStatusIcon()}
        <span className='text-sm'>
          {status === 'idle'
            ? 'Sin verificar'
            : status === 'success'
              ? 'Conexión HTTP OK'
              : 'Error de conexión HTTP'}
        </span>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div
        className={`rounded border p-4 ${
          status === 'success'
            ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
            : status === 'error'
              ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
              : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/30 dark:text-gray-300'
        }`}
      >
        <div className='mb-4 flex items-center space-x-3'>
          {getStatusIcon()}
          <h4 className='font-medium'>
            {status === 'idle'
              ? 'Sin verificar conexión HTTP'
              : status === 'success'
                ? 'Conexión HTTP exitosa'
                : 'Error en conexión HTTP'}
          </h4>
        </div>

        <div className='mb-2 flex items-center justify-between'>
          <span className='text-sm font-medium'>URL:</span>
          <span
            className='font-mono text-sm text-black dark:text-white'
            title={apiUrl}
          >
            {apiUrl ? apiUrl + '/api/notifications/ping' : 'No definida'}
          </span>
        </div>

        {lastTestedAt && (
          <div className='mb-2 flex items-center justify-between text-sm'>
            <span className='font-medium'>Última prueba:</span>
            <span className='text-black dark:text-white'>
              {lastTestedAt.toLocaleString()}
            </span>
          </div>
        )}

        {responseTime !== null && (
          <div className='mb-4 flex items-center space-x-3 text-sm text-black dark:text-white'>
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

        <Button
          className='mt-2 w-full'
          onClick={testDirectHttp}
          disabled={loading}
        >
          {loading ? 'Probando conexión...' : 'Probar Conexión HTTP'}
        </Button>
      </div>

      {logs.length > 0 && (
        <div className='rounded border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50'>
          <h3 className='mb-2 text-sm font-medium'>Registro de actividad</h3>
          <div className='h-32 overflow-y-auto rounded bg-slate-100 p-2 font-mono text-xs text-black dark:bg-slate-800 dark:text-white'>
            {logs.map((log, i) => (
              <div key={i} className='pb-1'>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {response && (
        <div className='rounded border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50'>
          <h3 className='mb-2 text-sm font-medium'>Respuesta</h3>
          <div className='overflow-auto rounded bg-slate-100 p-2 font-mono text-xs text-black dark:bg-slate-800 dark:text-white'>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
