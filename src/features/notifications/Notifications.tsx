'use client';

import { useState } from 'react';
import { useNotification } from './NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Bell, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Notifications() {
  const {
    unreadCount,
    notifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    isLoading,
    hasError
  } = useNotification();
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative h-8 w-8'
          aria-label='Notificaciones'
        >
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs'
              variant='destructive'
            >
              {unreadCount}
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
            {unreadCount > 0 && (
              <Button
                onClick={() => markAllAsRead()}
                variant='ghost'
                className='h-auto py-1 text-xs'
                disabled={refreshing}
              >
                Marcar todas
              </Button>
            )}
            <Link
              href='/dashboard/notifications'
              className='text-xs text-blue-600 hover:text-blue-800'
            >
              Ver todas
            </Link>
          </div>
        </div>

        <div className='max-h-80 overflow-y-auto'>
          {isLoading && !refreshing ? (
            <div className='space-y-2 p-4'>
              {[...Array(3)].map((_, i) => (
                <div key={i} className='flex animate-pulse flex-col gap-2'>
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
          ) : notifications.length === 0 ? (
            <div className='p-4 text-center text-muted-foreground'>
              No tienes notificaciones nuevas
            </div>
          ) : (
            <>
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'cursor-pointer border-b p-4 last:border-b-0 hover:bg-muted/50',
                    notification.type === 'error' && 'bg-destructive/10',
                    notification.type === 'warning' && 'bg-yellow-50/20',
                    notification.type === 'success' && 'bg-green-50/20'
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className='flex flex-col gap-1'>
                    <h4 className='font-medium'>{notification.title}</h4>
                    <p className='line-clamp-2 text-sm text-muted-foreground'>
                      {notification.message}
                    </p>
                    <span className='text-xs text-muted-foreground'>
                      {formatTimeDifference(notification.createdAt)}
                    </span>
                  </div>
                </div>
              ))}

              {notifications.length > 5 && (
                <div className='border-t p-2 text-center'>
                  <Link
                    href='/dashboard/notifications'
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    Ver todas las notificaciones ({notifications.length})
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
