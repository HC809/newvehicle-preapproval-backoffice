import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { LoanRequestStatistics } from 'types/Dashboard';

const DASHBOARD_KEY = 'dashboard';

export const useLoanRequestStatistics = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true
): UseQueryResult<LoanRequestStatistics, Error> => {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'loan-request-statistics'],
    queryFn: async (): Promise<LoanRequestStatistics> => {
      if (!apiClient) throw new Error('API client not initialized');

      const response = await apiClient.get<LoanRequestStatistics>(
        '/dashboard/loan-request-statistics'
      );
      return response.data;
    },
    enabled: !!apiClient && enabled
  });
};
