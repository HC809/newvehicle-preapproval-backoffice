'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToken } from '@/features/auth/TokenContext';
import notificationService, {
  UnifiedNotification
} from './SignalRNotificationService';
import { toast } from 'sonner';
import { LoanNotification, LoanNotificationType } from 'types/Notifications';
import { useNotificationStore } from '@/stores/notification-store';
import { useNotifications } from './api/notification-service';
import useAxios from '@/hooks/use-axios';
import { useQueryClient } from '@tanstack/react-query';

// Función para determinar si una notificación es del sistema (no es un chat message)
const isSystemNotification = (
  notification: UnifiedNotification
): notification is LoanNotification => {
  // Verificamos que sea una notificación del sistema Y que NO sea un mensaje de chat
  // Las notificaciones LoanNotificationType.Message deben ser manejadas por ChatContext
  return (
    'type' in notification &&
    notification.type !== LoanNotificationType.Message &&
    !('content' in notification)
  );
};

interface NotificationContextProps {
  notifications: LoanNotification[];
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
  hasError: boolean;
}

const NotificationContext = createContext<NotificationContextProps>({
  notifications: [],
  refreshNotifications: async () => {},
  isLoading: false,
  hasError: false
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { accessToken } = useToken();
  const apiClient = useAxios();
  const { addNotification } = useNotificationStore();
  const [hasError, setHasError] = useState(false);
  const queryClient = useQueryClient();

  // Usar el hook de React Query para obtener notificaciones
  const {
    data: notifications = [],
    isLoading,
    refetch,
    isError
  } = useNotifications(apiClient, !!accessToken);

  // Actualizar estado de error cuando hay un error en la query
  useEffect(() => {
    setHasError(isError);
  }, [isError]);

  // Configurar SignalR
  useEffect(() => {
    if (!accessToken) return;

    let retryCount = 0;
    const maxRetries = 3;
    let retryTimeout: NodeJS.Timeout;

    const initializeSignalR = async () => {
      try {
        // Iniciar conexión
        await notificationService.start(accessToken);

        // Suscribirse a notificaciones y filtrar solo las del sistema (no chat)
        const unsubscribe = notificationService.onNotification(
          (notification: UnifiedNotification) => {
            // Solo procesar notificaciones del sistema, no mensajes de chat
            if (!isSystemNotification(notification)) {
              return; // Ignorar mensajes de chat, los maneja ChatContext
            }

            // Mostrar toast según el tipo de notificación
            switch (notification.type) {
              case LoanNotificationType.StatusChanged:
                toast.info(notification.title, {
                  description: notification.message,
                  duration: 8000, // 8 segundos
                  className: 'bg-blue-50 border-blue-200',
                  action: {
                    label: 'Ver',
                    onClick: () => {
                      if (notification.loanRequestId) {
                        window.location.href = `/dashboard/loan-requests/${notification.loanRequestId}`;
                      }
                    }
                  }
                });
                break;
              case LoanNotificationType.Message:
                toast.success(notification.title, {
                  description: notification.message,
                  duration: 8000,
                  className: 'bg-green-50 border-green-200',
                  action: {
                    label: 'Ver',
                    onClick: () => {
                      if (notification.loanRequestId) {
                        window.location.href = `/dashboard/loan-requests/${notification.loanRequestId}`;
                      }
                    }
                  }
                });
                break;
              case LoanNotificationType.System:
                toast.warning(notification.title, {
                  description: notification.message,
                  duration: 10000, // 10 segundos para notificaciones del sistema
                  className: 'bg-yellow-50 border-yellow-200',
                  action: {
                    label: 'Ver',
                    onClick: () => {
                      if (notification.loanRequestId) {
                        window.location.href = `/dashboard/loan-requests/${notification.loanRequestId}`;
                      }
                    }
                  }
                });
                break;
              default:
                toast.info(notification.title, {
                  description: notification.message,
                  duration: 8000,
                  className: 'bg-blue-50 border-blue-200'
                });
            }

            // Actualizar estado global en Zustand - añadir notificación al store
            addNotification(notification);

            // Invalidar la caché de solicitudes de préstamo para forzar una actualización
            queryClient.invalidateQueries({ queryKey: ['loanRequests'] });

            // Si la notificación está relacionada con una solicitud específica, invalidar también esa solicitud
            if (notification.loanRequestId) {
              queryClient.invalidateQueries({
                queryKey: ['loanRequests', 'detail', notification.loanRequestId]
              });
            }

            // Recargar notificaciones para asegurar sincronización
            refetch();
          }
        );

        return unsubscribe;
      } catch (error) {
        // Reintentar un número limitado de veces
        if (retryCount < maxRetries) {
          retryCount++;

          // Esperar antes de reintentar (con backoff exponencial)
          return new Promise<() => void>((resolve) => {
            retryTimeout = setTimeout(async () => {
              const unsubscribe = await initializeSignalR();
              resolve(unsubscribe);
            }, retryCount * 3000);
          });
        }

        return () => {};
      }
    };

    // Iniciar SignalR y obtener la función de limpieza
    let unsubscribeFunc: (() => void) | undefined;

    initializeSignalR().then((unsubscribe) => {
      unsubscribeFunc = unsubscribe;
    });

    // Limpiar al desmontar
    return () => {
      if (unsubscribeFunc) unsubscribeFunc();
      notificationService.stop();
      clearTimeout(retryTimeout);
    };
  }, [accessToken, refetch, addNotification, queryClient]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        refreshNotifications: async () => {
          await refetch();
        },
        isLoading,
        hasError
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
