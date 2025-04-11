'use client';

import { useState } from 'react';
import { useNotification } from './NotificationContext';
import { useNotificationStore } from '@/stores/notification-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Bell, RefreshCw, FileSymlink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoanNotificationType } from 'types/Notifications';
import { useRouter } from 'next/navigation';

export default function Notifications() {
  const router = useRouter();
  const { refreshNotifications, isLoading, hasError } = useNotification();

  // Estado local del popover
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Estado global de notificaciones con Zustand
  const { count, clearBadgeOnly, recentNotifications } = useNotificationStore();

  // Navegar a la solicitud de préstamo
  const navigateToLoanRequest = (loanRequestId: string) => {
    setOpen(false); // Cerrar popover al navegar
    router.push(`/dashboard/loan-requests/${loanRequestId}`);
  };

  // Format time difference
  const formatTimeDifference = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `Hace ${diffInSeconds} segundos`;
    if (diffInSeconds < 3600)
      return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400)
      return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  // Manejar actualización manual
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshNotifications();
    } finally {
      setRefreshing(false);
    }
  };

  // Manejar apertura/cierre del popover
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    // Si se abre el popover, limpiar el contador del badge
    if (isOpen && count > 0) {
      clearBadgeOnly();
    }
  };

  // Redirigir a la página de notificaciones y cerrar el popover
  const handleViewAllClick = () => {
    setOpen(false); // Cerrar popover
    router.push('/dashboard/notifications');
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative h-8 w-8'
          aria-label='Notificaciones'
        >
          <Bell className='h-5 w-5' />
          {count > 0 && (
            <Badge
              className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs'
              variant='destructive'
            >
              {count > 99 ? '99+' : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0' align='end'>
        <div className='flex items-center justify-between border-b p-4'>
          <h3 className='font-medium'>Notificaciones</h3>
          <div className='flex items-center space-x-2'>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6'
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label='Actualizar notificaciones'
            >
              <RefreshCw
                className={cn('h-4 w-4', refreshing && 'animate-spin')}
              />
            </Button>
            <Button
              variant='link'
              size='sm'
              className='h-auto p-0 text-xs text-blue-600 hover:text-blue-800'
              onClick={handleViewAllClick}
            >
              Ver todas
            </Button>
          </div>
        </div>

        <div className='max-h-80 overflow-y-auto'>
          {isLoading && !refreshing ? (
            <div className='space-y-2 p-4'>
              {[...Array(3)].map((_, i) => (
                <div
                  key={`loading-skeleton-${i}`}
                  className='flex animate-pulse flex-col gap-2'
                >
                  <div className='h-4 w-3/4 rounded bg-muted/50'></div>
                  <div className='h-2 w-1/2 rounded bg-muted/30'></div>
                  <div className='h-3 w-full rounded bg-muted/40'></div>
                </div>
              ))}
            </div>
          ) : hasError ? (
            <div className='p-4 text-center'>
              <p className='text-sm text-destructive'>
                Error al cargar notificaciones
              </p>
              <Button
                variant='outline'
                size='sm'
                className='mt-2'
                onClick={handleRefresh}
              >
                Reintentar
              </Button>
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className='p-4 text-center text-muted-foreground'>
              No tienes notificaciones nuevas
            </div>
          ) : (
            <>
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'border-b p-4 last:border-b-0 hover:bg-muted/50',
                    notification.type === LoanNotificationType.System &&
                      'bg-destructive/10',
                    notification.type === LoanNotificationType.StatusChanged &&
                      'bg-yellow-50/20',
                    notification.type === LoanNotificationType.Message &&
                      'bg-green-50/20'
                  )}
                >
                  <div className='flex flex-col gap-1'>
                    <h4 className='font-medium'>{notification.title}</h4>
                    <p className='line-clamp-2 text-sm text-muted-foreground'>
                      {notification.message}
                    </p>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-muted-foreground'>
                        {formatTimeDifference(notification.createdAt)}
                      </span>
                      {notification.loanRequestId && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 p-1 text-xs text-primary hover:bg-primary/10 hover:text-primary'
                          onClick={() =>
                            navigateToLoanRequest(notification.loanRequestId!)
                          }
                        >
                          <FileSymlink className='mr-1 h-3 w-3' />
                          Ver solicitud
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className='border-t p-2 text-center'>
                <Button
                  variant='link'
                  size='sm'
                  className='text-sm text-blue-600 hover:text-blue-800'
                  onClick={handleViewAllClick}
                >
                  Ver todas las notificaciones
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
