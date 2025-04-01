'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react';
import { useToken } from '@/features/auth/TokenContext';
import notificationService from './SignalRNotificationService';
import { toast } from 'sonner';
import { LoanNotification, LoanNotificationType } from 'types/Notifications';
import { useNotificationStore } from '@/stores/notification-store';

interface NotificationContextProps {
  unreadCount: number;
  notifications: LoanNotification[];
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
  hasError: boolean;
}

const NotificationContext = createContext<NotificationContextProps>({
  unreadCount: 0,
  notifications: [],
  refreshNotifications: async () => {},
  isLoading: false,
  hasError: false
});

// Endpoints de la API de notificaciones
// NOTA: Asegúrese de que estas rutas coincidan con las de su backend
const API_NOTIFICATION_ENDPOINTS = {
  unread: '/api/notifications/unread'
};

// Función para verificar y componer la URL completa de la API
const getFullApiUrl = (endpoint: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not defined in environment variables'
    );
  }

  // Asegurar que no haya doble slash entre la base y el endpoint
  return `${apiUrl.replace(/\/$/, '')}${endpoint}`;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { accessToken } = useToken();
  const [notifications, setNotifications] = useState<LoanNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { addNotification } = useNotificationStore();

  // Cargar notificaciones no leídas
  const fetchUnreadNotifications = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setHasError(false);

    try {
      const endpoint = API_NOTIFICATION_ENDPOINTS.unread;
      const fullUrl = getFullApiUrl(endpoint);

      const response = await fetch(fullUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();

        // Si data no es un array, manejarlo apropiadamente
        if (!Array.isArray(data)) {
          setNotifications([]);
          setUnreadCount(0);
          return;
        }

        const formattedData = data.map((notification: any) => ({
          ...notification,
          type: notification.type as LoanNotificationType
        }));

        // Filtrar notificaciones expiradas
        const nonExpiredNotifications = formattedData.filter(
          (notification: LoanNotification) => {
            if (!notification.expiredAt) return true;
            return new Date(notification.expiredAt) > new Date();
          }
        );

        setNotifications(nonExpiredNotifications);
        setUnreadCount(nonExpiredNotifications.length);
      } else {
        setHasError(true);
      }
    } catch (error) {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  // Inicializar con el token
  useEffect(() => {
    if (accessToken) {
      fetchUnreadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [accessToken, fetchUnreadNotifications]);

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
            // Verificar si la notificación está expirada
            if (
              notification.expiredAt &&
              new Date(notification.expiredAt) <= new Date()
            ) {
              return; // Ignorar notificaciones expiradas
            }

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

            // Actualizar estado local
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Actualizar estado global en Zustand - añadir notificación al store
            addNotification(notification);

            // Recargar notificaciones para asegurar sincronización
            fetchUnreadNotifications();
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
  }, [accessToken, fetchUnreadNotifications, addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        refreshNotifications: fetchUnreadNotifications,
        isLoading,
        hasError
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
