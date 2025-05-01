import { useQuery, UseQueryResult } from '@tanstack/react-query';
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
      const response = await apiClient.get<LoanNotification[]>(
        NOTIFICATION_ENDPOINT
      );
      return response.data.map((notification) => ({
        ...notification,
        type: notification.type as LoanNotification['type']
      }));
    },
    enabled: !!apiClient && enabled,
    refetchInterval: 15000, // Refetch every 15 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 10000 // Consider data stale after 10 seconds
  });
};
