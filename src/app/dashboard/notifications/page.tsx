'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ReloadIcon } from '@radix-ui/react-icons';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useAxios from '@/hooks/use-axios';
import ErrorAlert from '@/components/custom/error-alert';
import KBar from '@/components/kbar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationList from '@/features/notifications/components/notification-list';
import { useNotification } from '@/features/notifications/NotificationContext';
import { SignalRConnectionStatus } from '@/features/notifications/components/connection-status';
import { ApiConnectivityTest } from '@/features/notifications/components/api-status';
import { WebSocketInspector } from '@/features/notifications/components/websocket-inspector';
import { TokenValidator } from '@/features/notifications/components/token-validator';
import { NegotiateTester } from '@/features/notifications/components/negotiate-tester';
import { HttpTester } from '@/features/notifications/components/http-tester';
import {
  useNotifications,
  useUnreadNotifications,
  useMarkAsRead,
  useMarkAllAsRead
} from '@/features/notifications/api/notification-service';
import { toast } from 'sonner';

// Variable para mostrar componentes de depuración (solo en desarrollo)
const isDevelopment = process.env.NODE_ENV === 'development';

function NotificationsContent() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const apiClient = useAxios();
  const queryClient = useQueryClient();

  // Obtener contexto global de notificaciones
  const { refreshNotifications: refreshContextNotifications } =
    useNotification();

  // Consultas para obtener notificaciones
  const {
    isLoading: isLoadingAll,
    isFetching: isFetchingAll,
    data: allNotifications,
    error: allError,
    refetch: refetchAll
  } = useNotifications(apiClient, activeTab === 'all');

  const {
    isLoading: isLoadingUnread,
    isFetching: isFetchingUnread,
    data: unreadNotifications,
    error: unreadError,
    refetch: refetchUnread
  } = useUnreadNotifications(apiClient, activeTab === 'unread');

  // Mutaciones para marcar como leídas
  const markAsReadMutation = useMarkAsRead(apiClient);
  const markAllAsReadMutation = useMarkAllAsRead(apiClient);

  // Determinar los datos activos según la pestaña
  const activeData =
    activeTab === 'all' ? allNotifications : unreadNotifications;
  const isLoading = activeTab === 'all' ? isLoadingAll : isLoadingUnread;
  const isFetching = activeTab === 'all' ? isFetchingAll : isFetchingUnread;
  const error = activeTab === 'all' ? allError : unreadError;
  const refetch = activeTab === 'all' ? refetchAll : refetchUnread;

  // Refrescar cuando cambia la pestaña
  useEffect(() => {
    refetch();
  }, [activeTab, refetch]);

  // Marcar una notificación como leída
  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
      toast.success('Notificación marcada como leída');

      // Invalidar consultas para actualizar los datos
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Actualizar también el contexto global
      refreshContextNotifications();
    } catch (error) {
      toast.error('Error al marcar la notificación como leída');
      console.error('Error marking notification as read:', error);
    }
  };

  // Marcar todas las notificaciones como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success('Todas las notificaciones han sido marcadas como leídas');

      // Invalidar consultas para actualizar los datos
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Actualizar también el contexto global
      refreshContextNotifications();
    } catch (error) {
      toast.error('Error al marcar las notificaciones como leídas');
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Acciones para KBar
  const kbarActions = {};

  return (
    <KBar actions={kbarActions}>
      <PageContainer>
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading
              title='Notificaciones'
              description='Gestiona tus notificaciones del sistema.'
            />
            <div className='flex items-center gap-4'>
              <Tabs
                value={activeTab}
                onValueChange={(value) =>
                  setActiveTab(value as 'all' | 'unread')
                }
                className='mr-2'
              >
                <TabsList>
                  <TabsTrigger value='all'>Todas</TabsTrigger>
                  <TabsTrigger value='unread'>No leídas</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                variant='default'
                size='icon'
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label='Recargar notificaciones'
              >
                <ReloadIcon
                  className={cn('h-4 w-4', isFetching && 'animate-spin')}
                />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Componentes de diagnóstico (solo en desarrollo) */}
          {isDevelopment && (
            <div className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <SignalRConnectionStatus />
                <ApiConnectivityTest />
              </div>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <TokenValidator />
                <WebSocketInspector />
              </div>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <NegotiateTester />
                <HttpTester />
              </div>
            </div>
          )}

          {error ? (
            <div className='space-y-4'>
              <ErrorAlert error={error?.message || String(error)} />
              <Button
                variant='outline'
                onClick={() => refetch()}
                disabled={isFetching}
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <NotificationList
              notifications={activeData || []}
              isLoading={isLoading || isFetching}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          )}
        </div>
      </PageContainer>
    </KBar>
  );
}

export default function NotificationsPage() {
  return <NotificationsContent />;
}
