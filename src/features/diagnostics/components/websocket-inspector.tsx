'use client';

import React, { useState, useRef, useEffect } from 'react';
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

export function WebSocketInspector() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    'idle' | 'connecting' | 'open' | 'closed' | 'error'
  >('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Limpiar el WebSocket al desmontar
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toISOString().substring(11, 19)}: ${message}`
    ]);
  };

  // API URL desde las variables de entorno
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const testWebSocket = async () => {
    setLoading(true);
    setStatus('connecting');
    setLogs([]);

    // Verificar si WebSocket está disponible en el navegador
    if (!window.WebSocket) {
      setStatus('error');
      addLog('Error: WebSocket no está disponible en este navegador');
      toast.error('WebSocket no está disponible en este navegador');
      setLoading(false);
      return;
    }

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

      // Cerrar cualquier conexión previa
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      // Convertir URL de HTTP a WebSocket (ws:// o wss://)
      let wsUrl = apiUrl
        .replace('http://', 'ws://')
        .replace('https://', 'wss://');
      // Añadir la ruta al hub de SignalR
      wsUrl = `${wsUrl}/notification-hub`;

      addLog(`Conectando a: ${wsUrl}`);

      // Crear una conexión WebSocket directa
      const token = String(session.accessToken);

      // Probar sin encode URL
      // const fullUrl = `${wsUrl}?access_token=${token}`;

      // Probar con encode URL
      const fullUrl = `${wsUrl}?access_token=${encodeURIComponent(token)}`;

      addLog(`URL completa: ${fullUrl.substring(0, 50)}...`);

      // Configurar opciones adicionales para WebSocket (solo algunas APIs las soportan)
      const ws = new WebSocket(fullUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('open');
        addLog('¡Conexión establecida correctamente!');
        toast.success('Conexión WebSocket establecida');

        // No enviamos datos para evitar problemas
        addLog(
          'Conexión abierta. WebSocket listo para recibir mensajes del servidor.'
        );
      };

      ws.onclose = (event) => {
        setStatus('closed');
        addLog(
          `Conexión cerrada: Código ${event.code}, Razón: ${event.reason || 'No especificada'}`
        );
        if (!event.wasClean) {
          addLog('La conexión se cerró de forma inesperada');

          // Mostrar información sobre el código de cierre
          switch (event.code) {
            case 1000:
              addLog('Cierre normal');
              break;
            case 1001:
              addLog('El endpoint se está desconectando');
              break;
            case 1002:
              addLog('Error de protocolo');
              break;
            case 1003:
              addLog('Tipo de datos no soportado');
              break;
            case 1005:
              addLog('No se proporcionó código de cierre');
              break;
            case 1006:
              addLog('Cierre anormal - Posible problema de red o de servidor');
              addLog(
                'CONSEJO: Este es común con CORS o certificados SSL inválidos'
              );
              break;
            case 1007:
              addLog('Datos inconsistentes');
              break;
            case 1008:
              addLog('Mensaje que viola política');
              break;
            case 1009:
              addLog('Mensaje demasiado grande');
              break;
            case 1010:
              addLog('Extensiones requeridas no negociadas');
              break;
            case 1011:
              addLog('Error inesperado en el servidor');
              break;
            case 1015:
              addLog('Error de TLS/SSL');
              addLog(
                'CONSEJO: Intenta usar HTTP en lugar de HTTPS durante desarrollo'
              );
              break;
            default:
              addLog(`Código de cierre desconocido: ${event.code}`);
          }
        }
      };

      ws.onerror = (error) => {
        setStatus('error');
        addLog(`Error en la conexión: ${error.type}`);
        toast.error('Error en la conexión WebSocket');

        // Sugerencias específicas de solución
        addLog('Posibles soluciones:');
        addLog(
          '1. Verifica que el servidor esté ejecutándose y aceptando WebSockets'
        );
        addLog(
          '2. Revisa que la política CORS en el servidor incluya el origen exacto de tu aplicación'
        );
        addLog('3. Asegúrate que la MISMA política CORS usada en el hub');
        addLog(
          '4. Durante desarrollo, intenta deshabilitar la verificación SSL si es necesario'
        );
        addLog(
          '5. Asegúrate que las reglas de firewall permiten conexiones WebSocket'
        );

        // Mostrar origen actual para depuración
        addLog(`Tu origen actual es: ${window.location.origin}`);
        addLog(
          'Este debe estar EXACTAMENTE en la lista de orígenes permitidos'
        );
      };

      ws.onmessage = (event) => {
        addLog(`Mensaje recibido: ${event.data}`);
      };

      // Establecer un timeout para cerrar la conexión después de 15 segundos
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          addLog('Cerrando conexión después de 15 segundos');
          ws.close(1000, 'Prueba completada');
        }
      }, 15000);
    } catch (error) {
      setStatus('error');
      addLog(
        `Error al crear la conexión: ${error instanceof Error ? error.message : String(error)}`
      );
      toast.error('Error al iniciar la conexión WebSocket');
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar manualmente la conexión
  const closeConnection = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Cerrado manualmente');
      addLog('Conexión cerrada manualmente');
    }
  };

  // Obtener color del estado
  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return 'bg-green-500 text-white';
      case 'closed':
        return 'bg-amber-500 text-white';
      case 'connecting':
        return 'bg-blue-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <Card className='mb-4'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-md'>Inspector WebSocket</CardTitle>
        <CardDescription>Prueba directa de conexión WebSocket</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='font-semibold'>Estado:</span>
            <Badge className={getStatusColor()}>
              {status === 'idle'
                ? 'No iniciado'
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>

          <div className='flex items-center justify-between'>
            <span className='font-semibold'>WebSocket URL:</span>
            <span
              className='max-w-[200px] truncate font-mono text-sm'
              title={apiUrl}
            >
              {apiUrl
                ? apiUrl.replace('http', 'ws') + '/notification-hub'
                : 'No definida'}
            </span>
          </div>

          <div className='mt-2 flex gap-2'>
            <Button
              onClick={testWebSocket}
              disabled={loading || status === 'open'}
              variant='outline'
              size='sm'
              className='flex-1'
            >
              {loading && <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />}
              {loading ? 'Conectando...' : 'Probar WebSocket'}
            </Button>

            <Button
              onClick={closeConnection}
              disabled={status !== 'open'}
              variant='outline'
              size='sm'
              className='flex-1'
            >
              Cerrar
            </Button>
          </div>

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
        </div>
      </CardContent>
    </Card>
  );
}
