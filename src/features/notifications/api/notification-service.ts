import {
  useQuery,
  useMutation,
  UseQueryResult,
  UseMutationResult
} from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { LoanNotification } from '../../../../types/Notifications';

const NOTIFICATIONS_KEY = 'notifications';
const NOTIFICATION_ENDPOINT = '/notifications';

// Obtener todas las notificaciones
export const useNotifications = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true
): UseQueryResult<LoanNotification[], Error> => {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, 'all'],
    queryFn: async (): Promise<LoanNotification[]> => {
      if (!apiClient) throw new Error('API client not initialized');

      console.log(`Fetching all notifications from: ${NOTIFICATION_ENDPOINT}`);
      const response = await apiClient.get<LoanNotification[]>(
        NOTIFICATION_ENDPOINT
      );
      return response.data.map((notification) => ({
        ...notification,
        type: notification.type as LoanNotification['type']
      }));
    },
    enabled: !!apiClient && enabled
  });
};

// Obtener notificaciones no leídas
export const useUnreadNotifications = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true
): UseQueryResult<LoanNotification[], Error> => {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, 'unread'],
    queryFn: async (): Promise<LoanNotification[]> => {
      if (!apiClient) throw new Error('API client not initialized');

      console.log(
        `Fetching unread notifications from: ${NOTIFICATION_ENDPOINT}/unread`
      );
      const response = await apiClient.get<LoanNotification[]>(
        `${NOTIFICATION_ENDPOINT}/unread`
      );
      return response.data.map((notification) => ({
        ...notification,
        type: notification.type as LoanNotification['type']
      }));
    },
    enabled: !!apiClient && enabled
  });
};

// Eliminar una notificación
export const useDeleteNotification = (
  apiClient: AxiosInstance | undefined
): UseMutationResult<void, Error, string> => {
  return useMutation({
    mutationKey: [NOTIFICATIONS_KEY, 'delete'],
    mutationFn: async (notificationId: string): Promise<void> => {
      if (!apiClient) throw new Error('API client not initialized');

      console.log(
        `Deleting notification at: ${NOTIFICATION_ENDPOINT}/${notificationId}`
      );
      await apiClient.delete(`${NOTIFICATION_ENDPOINT}/${notificationId}`);
    }
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
