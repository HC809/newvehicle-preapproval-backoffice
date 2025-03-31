'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Code } from 'lucide-react';

interface SignalRConnectionStatusProps {
  minimal?: boolean;
}

export function SignalRConnectionStatus({
  minimal = false
}: SignalRConnectionStatusProps) {
  const [status, setStatus] = useState<string>('Verificando conexión...');
  const [connectionState, setConnectionState] = useState<string>('');
  const [showBackendSuggestions, setShowBackendSuggestions] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [lastReconnectAttempt, setLastReconnectAttempt] = useState<Date | null>(
    null
  );

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Este efecto obtiene el estado de la conexión
  useEffect(() => {
    if (!isMounted) return;

    const checkConnectionState = () => {
      if (typeof window === 'undefined') return;

      // Verificar si existe la conexión SignalR en el window
      const signalRConnection = (window as any).__signalrConnection;

      if (!signalRConnection) {
        setStatus('No se encontró conexión SignalR');
        setConnectionState('Disconnected');
        return;
      }

      setConnectionState(signalRConnection.state);

      // Comprobar el estado de la conexión
      switch (signalRConnection.state) {
        case 'Connected':
          setStatus('Conectado exitosamente al hub SignalR');
          break;
        case 'Disconnected':
          setStatus('Desconectado del hub SignalR');
          break;
        case 'Connecting':
          setStatus('Conectando al hub SignalR...');
          break;
        case 'Reconnecting':
          setStatus('Reconectando al hub SignalR...');
          setLastReconnectAttempt(new Date());
          break;
        default:
          setStatus(`Estado de conexión SignalR: ${signalRConnection.state}`);
      }
    };

    // Verificar el estado inicial
    checkConnectionState();

    // Configurar un intervalo para verificar el estado periódicamente
    const intervalId = setInterval(checkConnectionState, 5000);

    // Intentar reconectar cuando se detecta que está desconectado
    const reconnectIfNeeded = () => {
      if (typeof window === 'undefined') return;

      const signalRConnection = (window as any).__signalrConnection;
      if (signalRConnection && signalRConnection.state === 'Disconnected') {
        try {
          signalRConnection.start();
          setLastReconnectAttempt(new Date());
        } catch (err) {
          console.error('Error al intentar reconectar:', err);
        }
      }
    };

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [isMounted]);

  const handleReconnect = () => {
    if (typeof window === 'undefined') return;

    const signalRConnection = (window as any).__signalrConnection;
    if (signalRConnection) {
      try {
        if (signalRConnection.state !== 'Connected') {
          signalRConnection.start();
          setLastReconnectAttempt(new Date());
          setStatus('Intentando reconectar...');
        }
      } catch (err) {
        console.error('Error al intentar reconectar:', err);
        setStatus(
          `Error al reconectar: ${err instanceof Error ? err.message : 'Error desconocido'}`
        );
      }
    } else {
      setStatus('No se encontró conexión SignalR para reconectar');
    }
  };

  // Información para desarrolladores sobre cómo implementar SignalR en su backend
  const backendCodeSuggestions = `
// Configuración recomendada para el backend .NET:

// 1. Configura CORS adecuadamente para permitir la conexión WebSocket
builder.Services.AddCors(options =>
{
    options.AddPolicy("SignalRClientPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Agrega tu origen del frontend
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Importante para WebSockets
    });
});

// 2. Configura SignalR
builder.Services.AddSignalR();

// 3. En el método Configure, aplica CORS ANTES de MapHub
app.UseCors("SignalRClientPolicy");

// 4. Mapea tu hub de SignalR
app.MapHub<NotificationsHub>("/notificationshub");
`;

  const getStatusIcon = () => {
    if (connectionState === 'Connected') {
      return (
        <CheckCircle
          className={
            minimal ? 'h-4 w-4 text-green-500' : 'h-6 w-6 text-green-500'
          }
        />
      );
    } else if (
      connectionState === 'Connecting' ||
      connectionState === 'Reconnecting'
    ) {
      return (
        <AlertTriangle
          className={
            minimal ? 'h-4 w-4 text-amber-500' : 'h-6 w-6 text-amber-500'
          }
        />
      );
    } else {
      return (
        <XCircle
          className={minimal ? 'h-4 w-4 text-red-500' : 'h-6 w-6 text-red-500'}
        />
      );
    }
  };

  const getStatusColor = () => {
    if (connectionState === 'Connected') {
      return 'text-green-700 dark:text-green-300 border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20';
    } else if (
      connectionState === 'Connecting' ||
      connectionState === 'Reconnecting'
    ) {
      return 'text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20';
    } else {
      return 'text-red-700 dark:text-red-300 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
    }
  };

  if (minimal) {
    return (
      <div className='flex items-center space-x-2'>
        {getStatusIcon()}
        <span className='text-sm'>{connectionState || 'Sin verificar'}</span>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className={`rounded border p-4 ${getStatusColor()}`}>
        <div className='mb-4 flex items-center space-x-3'>
          {getStatusIcon()}
          <h4 className='font-medium'>{status}</h4>
        </div>

        {lastReconnectAttempt && (
          <div className='mb-2 text-sm text-black dark:text-white'>
            <span className='font-medium'>Último intento de reconexión: </span>
            {lastReconnectAttempt.toLocaleString()}
          </div>
        )}

        <div className='mt-4 flex space-x-2'>
          <Button
            onClick={handleReconnect}
            disabled={
              connectionState === 'Connected' ||
              connectionState === 'Connecting'
            }
            className='w-full'
          >
            Reconectar
          </Button>

          <Button
            variant='outline'
            size='icon'
            onClick={() => setShowBackendSuggestions(!showBackendSuggestions)}
            title={showBackendSuggestions ? 'Ocultar código' : 'Mostrar código'}
          >
            <Code className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {showBackendSuggestions && (
        <div className='max-h-60 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50'>
          <h3 className='mb-2 text-sm font-medium'>
            Configuración recomendada para backend
          </h3>
          <pre className='whitespace-pre-wrap font-mono text-xs text-black dark:text-white'>
            {backendCodeSuggestions}
          </pre>
        </div>
      )}
    </div>
  );
}
