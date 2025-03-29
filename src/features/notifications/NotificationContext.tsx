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
import { Notification } from './types';
import { toast } from 'sonner';

interface NotificationContextProps {
  unreadCount: number;
  notifications: Notification[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
  hasError: boolean;
}

const NotificationContext = createContext<NotificationContextProps>({
  unreadCount: 0,
  notifications: [],
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  refreshNotifications: async () => {},
  isLoading: false,
  hasError: false
});

// Endpoints de la API de notificaciones
// NOTA: Asegúrese de que estas rutas coincidan con las de su backend
const API_NOTIFICATION_ENDPOINTS = {
  unread: '/api/notifications/unread',
  markAsRead: (id: string) => `/api/notifications/${id}/mark-as-read`,
  markAllAsRead: '/api/notifications/mark-all-as-read'
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [signalRInitialized, setSignalRInitialized] = useState(false);

  // Cargar notificaciones no leídas
  const fetchUnreadNotifications = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setHasError(false);

    try {
      const endpoint = API_NOTIFICATION_ENDPOINTS.unread;
      const fullUrl = getFullApiUrl(endpoint);
      console.log(`Fetching unread notifications from: ${fullUrl}`);

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
          console.error('Expected array of notifications but received:', data);
          setNotifications([]);
          setUnreadCount(0);
          return;
        }

        const formattedData = data.map((notification: any) => ({
          ...notification,
          type: notification.type as Notification['type']
        }));

        // Filtrar notificaciones expiradas
        const nonExpiredNotifications = formattedData.filter(
          (notification: Notification) => {
            if (!notification.expiredAt) return true;
            return new Date(notification.expiredAt) > new Date();
          }
        );

        setNotifications(nonExpiredNotifications);
        setUnreadCount(nonExpiredNotifications.length);
      } else {
        console.error(
          'Failed to fetch notifications:',
          response.status,
          response.statusText
        );
        setHasError(true);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
      setSignalRInitialized(false);
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
        setSignalRInitialized(true);

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
            const notificationType = notification.type || 'info';

            if (notificationType === 'success') {
              toast.success(`${notification.title}: ${notification.message}`);
            } else if (notificationType === 'error') {
              toast.error(`${notification.title}: ${notification.message}`);
            } else if (notificationType === 'warning') {
              toast.warning(`${notification.title}: ${notification.message}`);
            } else {
              toast.info(`${notification.title}: ${notification.message}`);
            }

            // Actualizar estado
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Recargar notificaciones para asegurar sincronización
            fetchUnreadNotifications();
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error(
          `SignalR connection attempt ${retryCount + 1} failed:`,
          error
        );

        // Reintentar un número limitado de veces
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(
            `Retrying SignalR connection in ${retryCount * 3} seconds...`
          );

          // Esperar antes de reintentar (con backoff exponencial)
          return new Promise<() => void>((resolve) => {
            retryTimeout = setTimeout(async () => {
              const unsubscribe = await initializeSignalR();
              resolve(unsubscribe);
            }, retryCount * 3000);
          });
        }

        console.error(
          `Failed to establish SignalR connection after ${maxRetries} attempts.`
        );
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
      setSignalRInitialized(false);
    };
  }, [accessToken, fetchUnreadNotifications]);

  // Marcar como leída
  const markAsRead = async (id: string) => {
    if (!accessToken) return;

    try {
      const endpoint = API_NOTIFICATION_ENDPOINTS.markAsRead(id);
      const fullUrl = getFullApiUrl(endpoint);
      console.log(`Marking notification as read at: ${fullUrl}`);

      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((prev) => Math.max(0, prev - 1)); // Nunca debe ser menor a 0
      } else {
        console.error(
          'Failed to mark notification as read:',
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Marcar todas como leídas
  const markAllAsRead = async () => {
    if (!accessToken) return;

    try {
      const endpoint = API_NOTIFICATION_ENDPOINTS.markAllAsRead;
      const fullUrl = getFullApiUrl(endpoint);
      console.log(`Marking all notifications as read at: ${fullUrl}`);

      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications([]);
        setUnreadCount(0);
      } else {
        console.error(
          'Failed to mark all notifications as read:',
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        markAsRead,
        markAllAsRead,
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
