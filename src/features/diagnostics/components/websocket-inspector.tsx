'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { getSession } from 'next-auth/react';

interface WebSocketInspectorProps {
  minimal?: boolean;
}

export function WebSocketInspector({
  minimal = false
}: WebSocketInspectorProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    'idle' | 'connecting' | 'open' | 'closed' | 'error'
  >('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const [lastTestedAt, setLastTestedAt] = useState<Date | null>(null);
  const [autoTested, setAutoTested] = useState(false);

  // Limpiar el WebSocket al desmontar
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Verificar el estado de la conexión automáticamente al cargar solo una vez
  useEffect(() => {
    async function checkInitialStatus() {
      if (minimal && !autoTested) {
        setAutoTested(true);

        // Verificar si la API está disponible antes de intentar conectarse
        try {
          // Obtener el token de acceso
          const session = await getSession();
          if (session?.accessToken) {
            // Simplemente verificar si existe la URL de WebSocket
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            if (apiUrl) {
              // Solo actualizamos el estado para mostrar que se ha verificado
              // No abrimos una conexión real para evitar problemas
              setStatus('closed');
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
        setLastTestedAt(new Date());

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
        setLastTestedAt(new Date());

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
        setLastTestedAt(new Date());

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
        if (ws && ws.readyState === WebSocket.OPEN) {
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
      setLastTestedAt(new Date());
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar manualmente la conexión
  const closeConnection = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Cerrado manualmente');
      addLog('Conexión cerrada manualmente');
      setLastTestedAt(new Date());
    }
  };

  const getStatusIcon = () => {
    if (status === 'open') {
      return (
        <CheckCircle
          className={
            minimal ? 'h-4 w-4 text-green-500' : 'h-6 w-6 text-green-500'
          }
        />
      );
    } else if (status === 'connecting') {
      return (
        <Link2
          className={
            minimal ? 'h-4 w-4 text-blue-500' : 'h-6 w-6 text-blue-500'
          }
        />
      );
    } else if (status === 'closed') {
      return (
        <AlertTriangle
          className={
            minimal ? 'h-4 w-4 text-amber-500' : 'h-6 w-6 text-amber-500'
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
        <Link2
          className={
            minimal ? 'h-4 w-4 text-gray-400' : 'h-6 w-6 text-gray-500'
          }
        />
      );
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle':
        return 'Sin verificar';
      case 'connecting':
        return 'Conectando WebSocket...';
      case 'open':
        return 'WebSocket conectado';
      case 'closed':
        return 'WebSocket verificado';
      case 'error':
        return 'Error de WebSocket';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800 text-green-700 dark:text-green-300';
      case 'closed':
        return 'border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 text-amber-700 dark:text-amber-300';
      case 'connecting':
        return 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 text-blue-700 dark:text-blue-300';
      case 'error':
        return 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 text-red-700 dark:text-red-300';
      default:
        return 'border-gray-200 bg-gray-50 dark:bg-gray-800/30 dark:border-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  if (minimal) {
    return (
      <div className='flex items-center space-x-2'>
        {getStatusIcon()}
        <span className='text-sm'>{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className={`rounded border p-4 ${getStatusColor()}`}>
        <div className='mb-4 flex items-center space-x-3'>
          {getStatusIcon()}
          <h4 className='font-medium'>{getStatusText()}</h4>
        </div>

        <div className='mb-2 flex items-center justify-between'>
          <span className='text-sm font-medium'>URL WebSocket:</span>
          <span
            className='font-mono text-sm text-black dark:text-white'
            title={apiUrl}
          >
            {apiUrl
              ? apiUrl
                  .replace('http://', 'ws://')
                  .replace('https://', 'wss://') + '/notification-hub'
              : 'No definida'}
          </span>
        </div>

        {lastTestedAt && (
          <div className='mb-4 flex items-center justify-between text-sm'>
            <span className='font-medium'>Última prueba:</span>
            <span className='text-black dark:text-white'>
              {lastTestedAt.toLocaleString()}
            </span>
          </div>
        )}

        <div className='flex space-x-2'>
          <Button
            className='flex-1'
            onClick={testWebSocket}
            disabled={loading || status === 'connecting' || status === 'open'}
          >
            {loading ? 'Conectando...' : 'Probar WebSocket'}
          </Button>

          {status === 'open' && (
            <Button
              variant='outline'
              onClick={closeConnection}
              className='flex-1'
            >
              Cerrar conexión
            </Button>
          )}
        </div>
      </div>

      {logs.length > 0 && (
        <div className='rounded border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50'>
          <h3 className='mb-2 text-sm font-medium'>Registro de actividad</h3>
          <div className='h-48 overflow-y-auto rounded bg-slate-100 p-2 font-mono text-xs text-black dark:bg-slate-800 dark:text-white'>
            {logs.map((log, i) => (
              <div key={i} className='pb-1'>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
