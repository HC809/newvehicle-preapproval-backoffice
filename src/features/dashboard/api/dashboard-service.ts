import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { DealershipStatistics, LoanRequestStatistics } from 'types/Dashboard';

const DASHBOARD_KEY = 'dashboard';

export interface DashboardData {
  loanRequestStats: LoanRequestStatistics;
  dealershipStats: DealershipStatistics;
}

// Combined hook to fetch both statistics at once
export const useDashboardData = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true
): UseQueryResult<DashboardData, Error> => {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'combined-stats'],
    queryFn: async (): Promise<DashboardData> => {
      if (!apiClient) throw new Error('API client not initialized');

      // Fetch both endpoints in parallel
      const [loanRequestStats, dealershipStats] = await Promise.all([
        fetchLoanRequestStatistics(apiClient),
        fetchDealershipStatistics(apiClient)
      ]);

      return {
        loanRequestStats,
        dealershipStats
      };
    },
    enabled: !!apiClient && enabled
  });
};

// Individual hooks for separate usage if needed
export const useLoanRequestStatistics = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true
): UseQueryResult<LoanRequestStatistics, Error> => {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'loan-request-statistics'],
    queryFn: async (): Promise<LoanRequestStatistics> => {
      if (!apiClient) throw new Error('API client not initialized');
      return fetchLoanRequestStatistics(apiClient);
    },
    enabled: !!apiClient && enabled
  });
};

export const useDealershipStatistics = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true
): UseQueryResult<DealershipStatistics, Error> => {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'dealership-statistics'],
    queryFn: async (): Promise<DealershipStatistics> => {
      if (!apiClient) throw new Error('API client not initialized');
      return fetchDealershipStatistics(apiClient);
    },
    enabled: !!apiClient && enabled
  });
};

// Helper functions to fetch individual endpoints
async function fetchLoanRequestStatistics(
  apiClient: AxiosInstance
): Promise<LoanRequestStatistics> {
  const response = await apiClient.get<LoanRequestStatistics>(
    '/dashboard/loan-request-statistics'
  );
  return response.data;
}

async function fetchDealershipStatistics(
  apiClient: AxiosInstance
): Promise<DealershipStatistics> {
  const response = await apiClient.get<DealershipStatistics>(
    '/dashboard/requests-by-dealership'
  );
  return response.data;
}
