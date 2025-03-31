'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { MoreHorizontal, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  LoanNotification,
  LoanNotificationType
} from '../../../../types/Notifications';

export interface NotificationListProps {
  notifications: LoanNotification[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
  error?: Error | null;
}

export default function NotificationList({
  notifications,
  isLoading,
  onDelete,
  error
}: NotificationListProps) {
  const [currentPage, setCurrentPage] = useState(1);

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

  // Función para obtener el nombre legible del tipo de notificación
  const getNotificationTypeName = (type: LoanNotificationType): string => {
    switch (type) {
      case LoanNotificationType.StatusChanged:
        return 'Estado Cambiado';
      case LoanNotificationType.Message:
        return 'Mensaje';
      case LoanNotificationType.System:
        return 'Sistema';
      default:
        return type;
    }
  };

  // Paginar las notificaciones
  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className='space-y-6'>
      {isLoading ? (
        <div className='space-y-4'>
          {[...Array(3)].map((_, i) => (
            <Card key={`loading-skeleton-${i}`} className='animate-pulse'>
              <CardHeader className='h-20 bg-muted/20'></CardHeader>
              <CardContent className='h-12 bg-muted/10'></CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className='p-4 text-center text-red-500'>
          Error al cargar notificaciones: {error.message}
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
            <Card key={notification.id} className='transition-colors'>
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
                          notification.type === LoanNotificationType.System
                            ? 'destructive'
                            : notification.type ===
                                LoanNotificationType.StatusChanged
                              ? 'default'
                              : notification.type ===
                                  LoanNotificationType.Message
                                ? 'outline'
                                : 'secondary'
                        }
                        className='text-xs'
                      >
                        {getNotificationTypeName(notification.type)}
                      </Badge>
                    </div>
                  </div>

                  {onDelete && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className='h-8 w-8'>
                          <MoreHorizontal className='h-4 w-4' />
                          <span className='sr-only'>Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          className='text-destructive focus:text-destructive'
                          onClick={() => onDelete(notification.id)}
                        >
                          <Trash className='mr-2 h-4 w-4' />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
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
              <PaginationItem key={`page-${i + 1}`}>
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
