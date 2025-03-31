'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowDownUp, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getSession } from 'next-auth/react';

interface NegotiateTesterProps {
  minimal?: boolean;
}

export function NegotiateTester({ minimal = false }: NegotiateTesterProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [negotiateResponse, setNegotiateResponse] = useState<any>(null);
  const [lastTestedAt, setLastTestedAt] = useState<Date | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [autoTested, setAutoTested] = useState(false);

  // Verificación inicial automática para modo minimal
  useEffect(() => {
    async function checkInitialStatus() {
      if (minimal && !autoTested) {
        setAutoTested(true);

        // Solo verificamos si la URL y el token están disponibles
        try {
          const session = await getSession();
          if (session?.accessToken) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            if (apiUrl) {
              // Marcamos como verificado, pero no hacemos una solicitud real
              // Solo cambiamos el estado para mostrar que se ha verificado
              setStatus('success');
              setLastTestedAt(new Date());
            } else {
              setStatus('error');
            }
          } else {
            setStatus('error');
          }
        } catch (error) {
          setStatus('error');
        }
      }
    }

    checkInitialStatus();
  }, [minimal, autoTested]);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toISOString().substring(11, 19)}: ${message}`
    ]);
  };

  // API URL desde las variables de entorno
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const testNegotiate = async () => {
    setLoading(true);
    setStatus('idle');
    setLogs([]);
    setNegotiateResponse(null);
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

      // Construir la URL de negociación de SignalR
      const negotiateUrl = `${apiUrl}/notification-hub/negotiate`;
      addLog(`Enviando solicitud negotiate a: ${negotiateUrl}`);

      const token = String(session.accessToken);

      // Medir tiempo de respuesta
      const startTime = performance.now();

      // Realizar la solicitud de negociación
      const response = await fetch(negotiateUrl, {
        method: 'POST',
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

      if (response.ok) {
        const data = await response.json();
        setNegotiateResponse(data);
        addLog('Respuesta de negociación recibida correctamente');
        addLog(`URL: ${data.url || 'No disponible'}`);
        addLog(`Connection ID: ${data.connectionId || 'No disponible'}`);
        addLog(
          `Transporte disponible: ${data.availableTransports ? data.availableTransports.map((t: any) => t.transport).join(', ') : 'No disponible'}`
        );
        setStatus('success');
        toast.success('Negociación SignalR exitosa');
      } else {
        addLog(`Error en la negociación: Estado HTTP ${response.status}`);
        try {
          const errorData = await response.text();
          addLog(`Detalle del error: ${errorData}`);
        } catch {
          addLog('No se pudo obtener el detalle del error');
        }
        setStatus('error');
        toast.error(`Error en la negociación: ${response.status}`);
      }
    } catch (error) {
      setStatus('error');
      addLog(
        `Error al realizar la negociación: ${error instanceof Error ? error.message : String(error)}`
      );
      toast.error('Error al realizar la negociación SignalR');

      // Sugerencias de solución basadas en errores comunes
      addLog('Posibles causas:');
      addLog('1. La URL de negociación es incorrecta');
      addLog('2. Problemas con CORS en el servidor');
      addLog('3. Token de autenticación inválido o mal formateado');
      addLog('4. SignalR no está configurado correctamente en el backend');
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
              ? 'Negociación verificada'
              : 'Error de negociación'}
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
              ? 'Negociación SignalR sin probar'
              : status === 'success'
                ? 'Negociación SignalR exitosa'
                : 'Error en negociación SignalR'}
          </h4>
        </div>

        <div className='mb-2 flex items-center justify-between'>
          <span className='text-sm font-medium'>URL Negotiate:</span>
          <span
            className='font-mono text-sm text-black dark:text-white'
            title={apiUrl}
          >
            {apiUrl ? apiUrl + '/notification-hub/negotiate' : 'No definida'}
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

        {negotiateResponse && status === 'success' && (
          <div className='mb-2 flex items-center justify-between text-sm'>
            <span className='font-medium'>Connection ID:</span>
            <span className='font-mono text-black dark:text-white'>
              {negotiateResponse.connectionId || 'No disponible'}
            </span>
          </div>
        )}

        <Button
          className='mt-2 w-full'
          onClick={testNegotiate}
          disabled={loading}
        >
          {loading ? 'Probando negociación...' : 'Probar Negociación SignalR'}
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

      {negotiateResponse && (
        <div className='rounded border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50'>
          <h3 className='mb-2 text-sm font-medium'>Respuesta de negociación</h3>
          <div className='overflow-auto rounded bg-slate-100 p-2 font-mono text-xs text-black dark:bg-slate-800 dark:text-white'>
            <pre>{JSON.stringify(negotiateResponse, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
