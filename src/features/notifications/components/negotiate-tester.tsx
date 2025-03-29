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
import { getSession } from 'next-auth/react';

export function NegotiateTester() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [negotiateResponse, setNegotiateResponse] = useState<any>(null);

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
    }
  };

  return (
    <Card className='mb-4'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-md'>Prueba de Negociación SignalR</CardTitle>
        <CardDescription>Verifica la negociación con el hub</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='font-semibold'>Estado:</span>
            <Badge
              className={
                status === 'success'
                  ? 'bg-green-500 text-white'
                  : status === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-500 text-white'
              }
            >
              {status === 'idle'
                ? 'No iniciado'
                : status === 'success'
                  ? 'Exitoso'
                  : 'Error'}
            </Badge>
          </div>

          <div className='flex items-center justify-between'>
            <span className='font-semibold'>URL Negotiate:</span>
            <span
              className='max-w-[200px] truncate font-mono text-sm'
              title={apiUrl}
            >
              {apiUrl ? apiUrl + '/notification-hub/negotiate' : 'No definida'}
            </span>
          </div>

          <Button
            onClick={testNegotiate}
            disabled={loading}
            variant='outline'
            size='sm'
            className='mt-2 w-full'
          >
            {loading && <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />}
            {loading ? 'Probando...' : 'Probar Negociación'}
          </Button>

          {logs.length > 0 && (
            <div className='mt-4'>
              <span className='text-sm font-semibold'>Registro:</span>
              <div className='mt-1 h-32 overflow-y-auto rounded bg-muted p-2 font-mono text-xs'>
                {logs.map((log, i) => (
                  <div key={i} className='pb-1'>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {negotiateResponse && (
            <div className='mt-4'>
              <span className='text-sm font-semibold'>Respuesta:</span>
              <div className='mt-1 overflow-auto rounded bg-muted p-2 font-mono text-xs'>
                <pre>{JSON.stringify(negotiateResponse, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
