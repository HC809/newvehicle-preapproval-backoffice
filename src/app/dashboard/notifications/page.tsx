'use client';

import { Suspense, useEffect } from 'react';
import { useNotifications } from '@/features/notifications/api/notification-service';
import NotificationList from '@/features/notifications/components/notification-list';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import useAxios from '@/hooks/use-axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNotificationStore } from '@/stores/notification-store';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

// Componente de fallback para la suspense
const NotificationsLoadingSkeleton = () => (
  <div className='space-y-4'>
    {[...Array(3)].map((_, i) => (
      <Card key={`loading-skeleton-${i}`} className='animate-pulse p-4'>
        <div className='mb-2 h-6 w-3/4 rounded bg-muted/20'></div>
        <div className='mb-4 flex gap-2'>
          <div className='h-4 w-24 rounded bg-muted/30'></div>
          <div className='h-4 w-16 rounded bg-muted/30'></div>
        </div>
        <div className='h-12 rounded bg-muted/10'></div>
      </Card>
    ))}
  </div>
);

export default function NotificationsPage() {
  const apiClient = useAxios();
  const { clearNotifications } = useNotificationStore();

  // Limpiar las notificaciones al cargar la página
  useEffect(() => {
    clearNotifications();
  }, [clearNotifications]);

  // Obtener las notificaciones
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
    isFetching
  } = useNotifications(apiClient);

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Notificaciones'
            description='Últimas notificaciones del sistema.'
          />
          <Button
            variant='default'
            size='icon'
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={cn('h-4 w-4', isFetching && 'animate-spin')}
            />
          </Button>
        </div>

        <Separator />

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

        <div className='max-w-full'>
          <Suspense fallback={<NotificationsLoadingSkeleton />}>
            <NotificationList
              notifications={notifications}
              isLoading={isLoading}
              error={error instanceof Error ? error : null}
            />
          </Suspense>
        </div>
      </div>
    </PageContainer>
  );
}
