'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface SignalRConnectionStatusProps {
  minimal?: boolean;
}

export function SignalRConnectionStatus({
  minimal = false
}: SignalRConnectionStatusProps) {
  const [status, setStatus] = useState<string>('Checking connection...');
  const [connectionState, setConnectionState] = useState<string>('');
  const [showBackendSuggestions, setShowBackendSuggestions] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
        setStatus('No SignalR connection found');
        setConnectionState('Disconnected');
        return;
      }

      setConnectionState(signalRConnection.state);

      // Comprobar el estado de la conexión
      switch (signalRConnection.state) {
        case 'Connected':
          setStatus('Connected successfully to SignalR hub');
          break;
        case 'Disconnected':
          setStatus('Disconnected from SignalR hub');
          break;
        case 'Connecting':
          setStatus('Connecting to SignalR hub...');
          break;
        case 'Reconnecting':
          setStatus('Reconnecting to SignalR hub...');
          break;
        default:
          setStatus(`SignalR connection state: ${signalRConnection.state}`);
      }
    };

    // Verificar el estado inicial
    checkConnectionState();

    // Configurar un intervalo para verificar el estado periódicamente
    const intervalId = setInterval(checkConnectionState, 5000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [isMounted]);

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

  if (minimal) {
    return (
      <div className='flex items-center justify-between'>
        <div className='space-y-0.5'>
          <p className='text-sm font-medium'>Estado de Conexión SignalR</p>
          <p className='text-xs text-muted-foreground'>{status}</p>
        </div>
        <div
          className={`h-3 w-3 rounded-full ${
            connectionState === 'Connected'
              ? 'bg-green-500'
              : connectionState === 'Connecting' ||
                  connectionState === 'Reconnecting'
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`}
        />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='space-y-0.5'>
          <p className='text-sm font-medium'>Estado de Conexión SignalR</p>
          <p className='text-xs text-muted-foreground'>{status}</p>
        </div>
        <div
          className={`h-3 w-3 rounded-full ${
            connectionState === 'Connected'
              ? 'bg-green-500'
              : connectionState === 'Connecting' ||
                  connectionState === 'Reconnecting'
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`}
        />
      </div>

      <Button
        variant='outline'
        size='sm'
        onClick={() => setShowBackendSuggestions(!showBackendSuggestions)}
      >
        {showBackendSuggestions
          ? 'Ocultar código de backend'
          : 'Mostrar sugerencias para backend'}
      </Button>

      {showBackendSuggestions && (
        <div className='max-h-60 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-4'>
          <h3 className='mb-2 text-sm font-medium'>
            Configuración recomendada para backend
          </h3>
          <pre className='whitespace-pre-wrap font-mono text-xs'>
            {backendCodeSuggestions}
          </pre>
        </div>
      )}
    </div>
  );
}
