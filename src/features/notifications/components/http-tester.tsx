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

export function HttpTester() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [response, setResponse] = useState<any>(null);

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
    }
  };

  return (
    <Card className='mb-4'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-md'>Prueba HTTP Directa</CardTitle>
        <CardDescription>Verifica la conexión HTTP con la API</CardDescription>
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
            <span className='font-semibold'>URL:</span>
            <span
              className='max-w-[200px] truncate font-mono text-sm'
              title={apiUrl}
            >
              {apiUrl ? apiUrl + '/api/notifications/ping' : 'No definida'}
            </span>
          </div>

          <Button
            onClick={testDirectHttp}
            disabled={loading}
            variant='outline'
            size='sm'
            className='mt-2 w-full'
          >
            {loading && <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />}
            {loading ? 'Probando...' : 'Probar Conexión HTTP'}
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

          {response && (
            <div className='mt-4'>
              <span className='text-sm font-semibold'>Respuesta:</span>
              <div className='mt-1 overflow-auto rounded bg-muted p-2 font-mono text-xs'>
                <pre>{JSON.stringify(response, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
