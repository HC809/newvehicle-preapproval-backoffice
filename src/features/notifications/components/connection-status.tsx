'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { getSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import notificationService from '../SignalRNotificationService';
import { toast } from 'sonner';

/**
 * Componente para depurar la conexión SignalR.
 * Muestra el estado de la conexión y permite realizar acciones.
 * SOLO PARA DESARROLLO - Quítalo en producción.
 */
export function SignalRConnectionStatus() {
  const [connectionState, setConnectionState] = useState('Disconnected');
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showBackendSuggestions, setShowBackendSuggestions] = useState(false);

  // Actualizar el estado de la conexión cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      // Obtener el estado actual de la conexión
      const state = notificationService.getConnectionState();
      setConnectionState(state);

      // Obtener el ID de conexión actual
      const id = notificationService.getConnectionId();
      setConnectionId(id);

      // Obtener la URL base de la API
      const url = notificationService.getApiUrl();
      setApiUrl(url);

      // Actualizar la hora de última verificación
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Función para reconectar manualmente
  const handleReconnect = async () => {
    try {
      setReconnecting(true);
      toast.info('Intentando reconectar a SignalR...');

      // Obtener el token de acceso
      const session = await getSession();
      if (!session?.accessToken) {
        console.error('No hay token de acceso disponible');
        toast.error('No hay token de acceso disponible para reconectar');
        return;
      }

      // Intentar reconectar
      await notificationService.reconnect();
      toast.success('Reconexión exitosa');
    } catch (error) {
      console.error('Error al reconectar:', error);
      toast.error(
        'Error al reconectar: ' +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setReconnecting(false);
    }
  };

  // Función para determinar el color del estado
  const getStateColor = () => {
    switch (connectionState) {
      case 'Connected':
        return 'bg-green-500 text-white';
      case 'Disconnected':
        return 'bg-red-500 text-white';
      case 'Connecting':
      case 'Reconnecting':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Recomendaciones para el código del backend
  const backendCodeSuggestions = `
// Asegúrate de que la política CORS correcta está siendo aplicada al hub
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",  // Origen exacto del frontend
                "https://localhost:3000"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();  // Crucial para WebSockets
    });
});

// Asegúrate de que estás aplicando la política CORS al hub
app.UseCors("CorsPolicy");  // Esto es crucial, debe ir ANTES de app.MapHub

// Y luego mapea tu hub
app.MapHub<notification-hub>("/notification-hub");

// Opcional: Configura SignalR con opciones adicionales
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});
`;

  return (
    <Card className='mb-4'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-md'>Estado de la Conexión SignalR</CardTitle>
        <CardDescription>Diagnóstico para desarrolladores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <span className='font-semibold'>Estado:</span>
            <Badge className={getStateColor()}>{connectionState}</Badge>
          </div>

          <div className='flex items-center justify-between'>
            <span className='font-semibold'>ID de Conexión:</span>
            <span className='font-mono text-sm'>
              {connectionId || 'Sin conexión'}
            </span>
          </div>

          <div className='flex items-center justify-between'>
            <span className='font-semibold'>API URL:</span>
            <span
              className='max-w-[200px] truncate font-mono text-sm'
              title={apiUrl}
            >
              {apiUrl || 'No definida'}
            </span>
          </div>

          <div className='flex items-center justify-between'>
            <span className='font-semibold'>Endpoint:</span>
            <span className='max-w-[200px] truncate font-mono text-sm'>
              {apiUrl ? apiUrl + '/notification-hub' : 'No definido'}
            </span>
          </div>

          <div className='flex items-center justify-between'>
            <span className='font-semibold'>Última verificación:</span>
            <span className='font-mono text-sm'>
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>

          <div className='mt-2 flex gap-2'>
            <Button
              onClick={handleReconnect}
              disabled={reconnecting || connectionState === 'Connected'}
              variant='outline'
              size='sm'
              className='flex-1'
            >
              {reconnecting && (
                <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
              )}
              {reconnecting ? 'Reconectando...' : 'Reconectar'}
            </Button>

            <Button
              onClick={() => setShowBackendSuggestions(!showBackendSuggestions)}
              variant='outline'
              size='sm'
              className='flex-1'
            >
              {showBackendSuggestions
                ? 'Ocultar sugerencias'
                : 'Ver sugerencias backend'}
            </Button>
          </div>

          {showBackendSuggestions && (
            <div className='mt-4'>
              <div className='mb-1 text-sm font-semibold'>
                Sugerencias para el backend:
              </div>
              <div className='max-h-48 overflow-auto rounded bg-muted p-2 font-mono text-xs'>
                <pre>{backendCodeSuggestions}</pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
