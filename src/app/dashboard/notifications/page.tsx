'use client';

import { Suspense, useEffect, useState } from 'react';
import { useNotifications } from '@/features/notifications/api/notification-service';
import NotificationList from '@/features/notifications/components/notification-list';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import useAxios from '@/hooks/use-axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Agregar CSS personalizado para el scrollbar
const scrollbarStyles = `
  /* Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--muted-foreground)/0.3) transparent;
  }
  
  /* Chrome, Edge, and Safari */
  *::-webkit-scrollbar {
    width: 8px;
  }
  
  *::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 5px;
  }
  
  *::-webkit-scrollbar-thumb {
    background-color: hsl(var(--muted-foreground)/0.2);
    border-radius: 14px;
    border: 2px solid transparent;
  }
  
  *::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--muted-foreground)/0.4);
  }
`;

export default function NotificationsPage() {
  const apiClient = useAxios();
  const [containerHeight, setContainerHeight] = useState('calc(100vh - 6rem)');

  // Calcular la altura del contenedor al cargar y al cambiar el tamaño de la ventana
  useEffect(() => {
    const calculateHeight = () => {
      // Restar la altura del header y un padding adicional
      const headerHeight = 120; // Aproximadamente 6rem más algo de padding
      const windowHeight = window.innerHeight;
      setContainerHeight(`${windowHeight - headerHeight}px`);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  // Obtener las notificaciones
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch,
    isFetching
  } = useNotifications(apiClient);

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

  return (
    <>
      <style jsx global>
        {scrollbarStyles}
      </style>
      <div className='container mx-auto px-4 py-6'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>Notificaciones</h1>
          <Button
            variant='outline'
            size='icon'
            onClick={() => refetch()}
            disabled={isFetching}
            className='transition-all duration-200 hover:bg-muted/80'
          >
            <RefreshCw
              className={cn('h-4 w-4', isFetching && 'animate-spin')}
            />
            <span className='sr-only'>Actualizar notificaciones</span>
          </Button>
        </div>

        {error && (
          <Alert variant='destructive' className='mx-auto mb-6 max-w-3xl'>
            <AlertCircle className='h-4 w-4' />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : 'Error desconocido al cargar notificaciones'}
            </AlertDescription>
          </Alert>
        )}

        <div className='flex justify-center'>
          <div
            className='w-full max-w-3xl overflow-auto rounded-lg pr-4'
            style={{ height: containerHeight }}
          >
            <div className='mr-3'>
              <Suspense fallback={<NotificationsLoadingSkeleton />}>
                <NotificationList
                  notifications={notifications}
                  isLoading={isLoading}
                  error={error instanceof Error ? error : null}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
