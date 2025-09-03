import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import {
  DealershipStatistics,
  LoanRequestStatistics,
  VehicleTypeStatistics,
  StatusCityStatistics
} from 'types/Dashboard';

const DASHBOARD_KEY = 'dashboard';

export interface DashboardData {
  loanRequestStats: LoanRequestStatistics;
  dealershipStats: DealershipStatistics;
  vehicleTypeStats: VehicleTypeStatistics;
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

      // Fetch all endpoints in parallel
      const [loanRequestStats, dealershipStats, vehicleTypeStats] =
        await Promise.all([
          fetchLoanRequestStatistics(apiClient),
          fetchDealershipStatistics(apiClient),
          fetchVehicleTypeStatistics(apiClient)
        ]);

      return {
        loanRequestStats,
        dealershipStats,
        vehicleTypeStats
      };
    },
    enabled: !!apiClient && enabled
  });
};

// New hook for status and city statistics
export const useStatusCityStatistics = (
  apiClient: AxiosInstance | undefined,
  month?: number,
  year?: number,
  enabled: boolean = true
): UseQueryResult<StatusCityStatistics, Error> => {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'status-city-statistics', month, year],
    queryFn: async (): Promise<StatusCityStatistics> => {
      if (!apiClient) throw new Error('API client not initialized');
      return fetchStatusCityStatistics(apiClient, month, year);
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

export const useVehicleTypeStatistics = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true
): UseQueryResult<VehicleTypeStatistics, Error> => {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'vehicle-type-statistics'],
    queryFn: async (): Promise<VehicleTypeStatistics> => {
      if (!apiClient) throw new Error('API client not initialized');
      return fetchVehicleTypeStatistics(apiClient);
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

async function fetchVehicleTypeStatistics(
  apiClient: AxiosInstance
): Promise<VehicleTypeStatistics> {
  const response = await apiClient.get<VehicleTypeStatistics>(
    '/dashboard/requests-by-vehicle-type'
  );
  return response.data;
}

// New helper function for status and city statistics
async function fetchStatusCityStatistics(
  apiClient: AxiosInstance,
  month?: number,
  year?: number
): Promise<StatusCityStatistics> {
  const currentDate = new Date();
  const currentMonth = month ?? currentDate.getMonth() + 1; // getMonth() returns 0-11
  const currentYear = year ?? currentDate.getFullYear();

  const response = await apiClient.get<StatusCityStatistics>(
    '/dashboard/loan-requests-by-status-and-city',
    {
      params: {
        month: currentMonth,
        year: currentYear
      }
    }
  );
  return response.data;
}
