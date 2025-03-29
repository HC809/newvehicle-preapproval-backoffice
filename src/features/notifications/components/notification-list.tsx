'use client';

import { useState } from 'react';
import { Notification } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Check, MoreHorizontal, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification?: (id: string) => void;
}

export default function NotificationList({
  notifications,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification
}: NotificationListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const itemsPerPage = 10;

  // Formatea la fecha relativa
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `Hace ${diffInSeconds} segundos`;
    if (diffInSeconds < 3600)
      return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400)
      return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800)
      return `Hace ${Math.floor(diffInSeconds / 86400)} días`;

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrar las notificaciones
  const filteredNotifications = notifications.filter((notification) => {
    // Filtro por estado (leído/no leído)
    if (filter === 'read' && !notification.isRead) return false;
    if (filter === 'unread' && notification.isRead) return false;

    // Filtro por tipo
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;

    return true;
  });

  // Paginar las notificaciones
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Obtener tipos únicos de notificaciones
  const uniqueTypes = Array.from(new Set(notifications.map((n) => n.type)));

  return (
    <div className='space-y-6'>
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <div className='flex flex-wrap gap-2'>
          <Select
            value={filter}
            onValueChange={(value) => {
              setFilter(value as 'all' | 'unread' | 'read');
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filtrar por estado' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todas</SelectItem>
              <SelectItem value='unread'>No leídas</SelectItem>
              <SelectItem value='read'>Leídas</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Filtrar por tipo' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Todos los tipos</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filter === 'unread' && (
          <Button
            variant='outline'
            onClick={onMarkAllAsRead}
            disabled={!filteredNotifications.some((n) => !n.isRead)}
          >
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className='space-y-4'>
          {[...Array(3)].map((_, i) => (
            <Card key={i} className='animate-pulse'>
              <CardHeader className='h-20 bg-muted/20'></CardHeader>
              <CardContent className='h-12 bg-muted/10'></CardContent>
            </Card>
          ))}
        </div>
      ) : paginatedNotifications.length === 0 ? (
        <Card>
          <CardContent className='flex h-40 flex-col items-center justify-center'>
            <p className='text-muted-foreground'>
              No hay notificaciones que mostrar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {paginatedNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                'transition-colors',
                !notification.isRead && 'border-l-4 border-l-primary'
              )}
            >
              <CardHeader className='pb-2'>
                <div className='flex items-start justify-between'>
                  <div className='flex flex-col'>
                    <CardTitle className='text-lg'>
                      {notification.title}
                    </CardTitle>
                    <div className='mt-1 flex items-center gap-2'>
                      <span className='text-xs text-muted-foreground'>
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                      <Badge
                        variant={
                          notification.type === 'error'
                            ? 'destructive'
                            : notification.type === 'warning'
                              ? 'default'
                              : notification.type === 'success'
                                ? 'outline'
                                : 'secondary'
                        }
                        className='text-xs'
                      >
                        {notification.type.charAt(0).toUpperCase() +
                          notification.type.slice(1)}
                      </Badge>
                      {notification.isRead && (
                        <Badge variant='outline' className='bg-muted text-xs'>
                          Leída
                        </Badge>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='icon' className='h-8 w-8'>
                        <MoreHorizontal className='h-4 w-4' />
                        <span className='sr-only'>Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      {!notification.isRead && (
                        <DropdownMenuItem
                          onClick={() => onMarkAsRead(notification.id)}
                        >
                          <Check className='mr-2 h-4 w-4' />
                          <span>Marcar como leída</span>
                        </DropdownMenuItem>
                      )}
                      {onDeleteNotification && (
                        <DropdownMenuItem
                          className='text-destructive focus:text-destructive'
                          onClick={() => onDeleteNotification(notification.id)}
                        >
                          <Trash className='mr-2 h-4 w-4' />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className='text-sm'>{notification.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className='mt-4'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={
                  currentPage === 1
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
