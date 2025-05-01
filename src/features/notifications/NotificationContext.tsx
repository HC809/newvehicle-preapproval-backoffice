'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToken } from '@/features/auth/TokenContext';
import notificationService from './SignalRNotificationService';
import { toast } from 'sonner';
import { LoanNotification, LoanNotificationType } from 'types/Notifications';
import { useNotificationStore } from '@/stores/notification-store';
import { useNotifications } from './api/notification-service';
import useAxios from '@/hooks/use-axios';

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

        // Suscribirse a notificaciones
        const unsubscribe = notificationService.onNotification(
          (notification) => {
            // Mostrar toast según el tipo de notificación
            switch (notification.type) {
              case LoanNotificationType.StatusChanged:
                toast.info(`${notification.title}: ${notification.message}`);
                break;
              case LoanNotificationType.Message:
                toast.success(`${notification.title}: ${notification.message}`);
                break;
              case LoanNotificationType.System:
                toast.warning(`${notification.title}: ${notification.message}`);
                break;
              default:
                toast.info(`${notification.title}: ${notification.message}`);
            }

            // Actualizar estado global en Zustand - añadir notificación al store
            addNotification(notification);

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
  }, [accessToken, refetch, addNotification]);

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
