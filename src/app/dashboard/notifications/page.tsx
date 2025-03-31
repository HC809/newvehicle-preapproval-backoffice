'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useNotifications,
  useDeleteNotification
} from '@/features/notifications/api/notification-service';
import NotificationList from '@/features/notifications/components/notification-list';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SignalRConnectionStatus } from '@/features/diagnostics/components/connection-status';
import { ApiConnectivityTest } from '@/features/diagnostics/components/api-status';
import { TokenValidator } from '@/features/diagnostics/components/token-validator';
import { NegotiateTester } from '@/features/diagnostics/components/negotiate-tester';
import { WebSocketInspector } from '@/features/diagnostics/components/websocket-inspector';
import { HttpTester } from '@/features/diagnostics/components/http-tester';
import useAxios from '@/hooks/use-axios';

export default function NotificationsPage() {
  const apiClient = useAxios();

  // Obtener las notificaciones
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useNotifications(apiClient);

  // Mutación para eliminar notificaciones
  const { mutate: deleteNotification } = useDeleteNotification(apiClient);

  // Manejar eliminación de notificación
  const handleDeleteNotification = (id: string) => {
    deleteNotification(id, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  return (
    <div className='container mx-auto space-y-8 py-6'>
      <h1 className='text-3xl font-bold'>Notificaciones</h1>

      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : 'Error desconocido al cargar notificaciones'}
          </AlertDescription>
        </Alert>
      )}

      <div className='space-y-6'>
        {/* Lista de notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Cargando...</div>}>
              <NotificationList
                notifications={notifications}
                isLoading={isLoading}
                onDelete={handleDeleteNotification}
                error={error instanceof Error ? error : null}
              />
            </Suspense>
          </CardContent>
        </Card>

        {/* Componentes de diagnóstico en entorno de desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Estado de SignalR</CardTitle>
              </CardHeader>
              <CardContent>
                <SignalRConnectionStatus />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conectividad API</CardTitle>
              </CardHeader>
              <CardContent>
                <ApiConnectivityTest />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Validador de Token</CardTitle>
              </CardHeader>
              <CardContent>
                <TokenValidator />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tester de Negotiate</CardTitle>
              </CardHeader>
              <CardContent>
                <NegotiateTester />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inspector WebSocket</CardTitle>
              </CardHeader>
              <CardContent>
                <WebSocketInspector />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tester HTTP</CardTitle>
              </CardHeader>
              <CardContent>
                <HttpTester />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
