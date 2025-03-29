import {
  useQuery,
  useMutation,
  UseQueryResult,
  UseMutationResult
} from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { Notification } from '../types';

const NOTIFICATIONS_KEY = 'notifications';
// NOTA: Asegúrese de que esta ruta coincida con la configuración de su backend
// Si el backend espera /notifications en lugar de /api/notifications, ajuste este valor
const NOTIFICATION_ENDPOINT = '/notifications';

// Obtener todas las notificaciones
export const useNotifications = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true
): UseQueryResult<Notification[], Error> => {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, 'all'],
    queryFn: async (): Promise<Notification[]> => {
      if (!apiClient) throw new Error('API client not initialized');

      console.log(`Fetching all notifications from: ${NOTIFICATION_ENDPOINT}`);
      const response = await apiClient.get<Notification[]>(
        NOTIFICATION_ENDPOINT
      );
      return response.data.map((notification) => ({
        ...notification,
        type: notification.type as Notification['type']
      }));
    },
    enabled: !!apiClient && enabled
  });
};

// Obtener notificaciones no leídas
export const useUnreadNotifications = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true
): UseQueryResult<Notification[], Error> => {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, 'unread'],
    queryFn: async (): Promise<Notification[]> => {
      if (!apiClient) throw new Error('API client not initialized');

      console.log(
        `Fetching unread notifications from: ${NOTIFICATION_ENDPOINT}/unread`
      );
      const response = await apiClient.get<Notification[]>(
        `${NOTIFICATION_ENDPOINT}/unread`
      );
      return response.data.map((notification) => ({
        ...notification,
        type: notification.type as Notification['type']
      }));
    },
    enabled: !!apiClient && enabled
  });
};

// Marcar una notificación como leída
export const useMarkAsRead = (
  apiClient: AxiosInstance | undefined
): UseMutationResult<void, Error, string> => {
  return useMutation({
    mutationKey: [NOTIFICATIONS_KEY, 'markAsRead'],
    mutationFn: async (notificationId: string): Promise<void> => {
      if (!apiClient) throw new Error('API client not initialized');

      console.log(
        `Marking notification as read at: ${NOTIFICATION_ENDPOINT}/${notificationId}/mark-as-read`
      );
      await apiClient.put(
        `${NOTIFICATION_ENDPOINT}/${notificationId}/mark-as-read`
      );
    }
  });
};

// Marcar todas las notificaciones como leídas
export const useMarkAllAsRead = (
  apiClient: AxiosInstance | undefined
): UseMutationResult<void, Error, void> => {
  return useMutation({
    mutationKey: [NOTIFICATIONS_KEY, 'markAllAsRead'],
    mutationFn: async (): Promise<void> => {
      if (!apiClient) throw new Error('API client not initialized');

      console.log(
        `Marking all notifications as read at: ${NOTIFICATION_ENDPOINT}/mark-all-as-read`
      );
      await apiClient.put(`${NOTIFICATION_ENDPOINT}/mark-all-as-read`);
    }
  });
};
