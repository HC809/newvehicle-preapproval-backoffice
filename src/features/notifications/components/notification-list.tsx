'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import {
  MessageSquare,
  AlertTriangle,
  BellRing,
  FileSymlink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  LoanNotification,
  LoanNotificationType
} from '../../../../types/Notifications';

export interface NotificationListProps {
  notifications: LoanNotification[];
  isLoading: boolean;
  error?: Error | null;
}

export default function NotificationList({
  notifications,
  isLoading,
  error
}: NotificationListProps) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // Navegar a la solicitud de préstamo
  const navigateToLoanRequest = (loanRequestId: string) => {
    router.push(`/dashboard/loan-requests/${loanRequestId}`);
  };

  // Formatea la fecha relativa
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `Ahora`;
    if (diffInSeconds < 3600)
      return `Hace ${Math.floor(diffInSeconds / 60)} ${Math.floor(diffInSeconds / 60) === 1 ? 'minuto' : 'minutos'}`;
    if (diffInSeconds < 86400)
      return `Hace ${Math.floor(diffInSeconds / 3600)} ${Math.floor(diffInSeconds / 3600) === 1 ? 'hora' : 'horas'}`;
    if (diffInSeconds < 604800)
      return `Hace ${Math.floor(diffInSeconds / 86400)} ${Math.floor(diffInSeconds / 86400) === 1 ? 'día' : 'días'}`;

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
        return 'Cambio de Estado';
      case LoanNotificationType.Message:
        return 'Mensaje';
      case LoanNotificationType.System:
        return 'Sistema';
      default:
        return type;
    }
  };

  // Función para obtener el icono según el tipo de notificación
  const getNotificationIcon = (type: LoanNotificationType) => {
    switch (type) {
      case LoanNotificationType.System:
        return <AlertTriangle className='h-5 w-5 text-destructive' />;
      case LoanNotificationType.Message:
        return (
          <MessageSquare className='h-5 w-5 text-green-500 dark:text-green-400' />
        );
      case LoanNotificationType.StatusChanged:
        return <FileSymlink className='h-5 w-5 text-primary' />;
      default:
        return <BellRing className='h-5 w-5 text-muted-foreground' />;
    }
  };

  // Obtener color de fondo para el badge según el tipo
  const getBadgeColorClass = (type: LoanNotificationType): string => {
    switch (type) {
      case LoanNotificationType.System:
        return 'bg-red-100 text-red-800 border-red-300';
      case LoanNotificationType.StatusChanged:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case LoanNotificationType.Message:
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Paginar las notificaciones
  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className='flex w-full flex-col'>
      {isLoading ? (
        <div className='space-y-5 pb-4'>
          {[...Array(3)].map((_, i) => (
            <Card
              key={`loading-skeleton-${i}`}
              className='animate-pulse overflow-hidden border-muted/60'
            >
              <CardContent className='p-5 pl-9'>
                <div className='flex'>
                  <div className='mr-4 h-5 w-5 rounded-full bg-muted/30'></div>
                  <div className='flex-1'>
                    <div className='mb-2 flex items-center gap-2'>
                      <div className='h-5 w-3/5 rounded bg-muted/20'></div>
                      <div className='h-5 w-24 rounded-full border border-gray-300 bg-gray-200'></div>
                    </div>
                    <div className='h-12 rounded bg-muted/10'></div>
                    <div className='mt-2 h-3 w-24 rounded bg-muted/20'></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive'>
          Error al cargar notificaciones: {error.message}
        </div>
      ) : paginatedNotifications.length === 0 ? (
        <div className='flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center'>
          <p className='text-muted-foreground'>
            No hay notificaciones que mostrar
          </p>
        </div>
      ) : (
        <>
          <div className='space-y-5 pb-24'>
            {paginatedNotifications.map((notification) => (
              <Card
                key={notification.id}
                className='overflow-hidden rounded-lg border-muted/60 transition-all duration-200 hover:shadow-md'
              >
                <CardContent className='p-0'>
                  <div
                    className='flex border-l-4 border-l-transparent p-5'
                    style={{
                      borderLeftColor:
                        notification.type === LoanNotificationType.System
                          ? 'hsl(var(--destructive))'
                          : notification.type ===
                              LoanNotificationType.StatusChanged
                            ? 'hsl(var(--primary))'
                            : notification.type === LoanNotificationType.Message
                              ? 'rgb(34, 197, 94)'
                              : 'hsl(var(--muted))'
                    }}
                  >
                    <div className='mr-4 flex-shrink-0 self-start pt-1'>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className='flex-1'>
                      <div className='mb-2 flex flex-wrap items-center gap-2'>
                        <h3 className='text-base font-semibold'>
                          {notification.title}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${getBadgeColorClass(notification.type)}`}
                        >
                          {getNotificationTypeName(notification.type)}
                        </span>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        {notification.message}
                      </p>
                      <div className='mt-2 text-xs text-muted-foreground'>
                        {formatRelativeTime(notification.createdAt)}
                      </div>
                    </div>

                    {notification.loanRequestId && (
                      <div className='ml-2 flex items-center self-center'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex items-center gap-1 text-primary hover:bg-primary/10 hover:text-primary'
                          onClick={() =>
                            navigateToLoanRequest(notification.loanRequestId!)
                          }
                        >
                          <FileSymlink className='h-4 w-4' />
                          <span className='hidden sm:inline'>
                            Ver solicitud
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className='mt-4 border-t bg-background py-3 shadow-md'>
              <Pagination>
                <PaginationContent className='flex flex-wrap items-center justify-center gap-2'>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className={`h-9 rounded border px-4 ${
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer hover:bg-muted'
                      }`}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={`page-${i + 1}`}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className='h-9 min-w-9 px-3'
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
                      className={`h-9 rounded border px-4 ${
                        currentPage === totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer hover:bg-muted'
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
