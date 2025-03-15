import {
  useQuery,
  useMutation,
  UseQueryResult,
  UseMutationResult
} from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import {
  LoanRequest,
  LoanRequestListingParams,
  LoanRequestDetail
} from 'types/LoanRequests';

const LOAN_REQUESTS_KEY = 'loanRequests';

// Función para consultar Equifax
export const checkClientEquifax = async (
  apiClient: AxiosInstance,
  clientDni: string,
  loanRequestId: string
): Promise<boolean> => {
  if (!apiClient) throw new Error('API client not initialized');
  if (!clientDni) throw new Error('Client DNI is required');
  if (!loanRequestId) throw new Error('Loan request ID is required');

  const response = await apiClient.post('/clients/equifax', {
    clientDni,
    loanRequestId
  });

  return response.status === 200;
};

// Hook para usar la mutación de Equifax
export const useCheckEquifax = (
  apiClient: AxiosInstance | undefined
): UseMutationResult<
  boolean,
  string,
  { clientDni: string; loanRequestId: string }
> => {
  return useMutation({
    mutationFn: async ({ clientDni, loanRequestId }) => {
      if (!apiClient) throw new Error('API client not initialized');
      return checkClientEquifax(apiClient, clientDni, loanRequestId);
    }
  });
};

// Hook para marcar la verificación de Equifax como completada
export const useMarkEquifaxChecked = (
  apiClient: AxiosInstance | undefined
): UseMutationResult<void, string, string> => {
  return useMutation({
    mutationFn: async (loanRequestId) => {
      if (!apiClient) throw new Error('API client not initialized');
      await apiClient.patch(`/loan-requests/${loanRequestId}/equifax-check`, {
        equifaxChecked: true
      });
    }
  });
};

// Hook para marcar el cálculo de Bantotal como completado
export const useMarkBantotalChecked = (
  apiClient: AxiosInstance | undefined
): UseMutationResult<void, string, string> => {
  return useMutation({
    mutationFn: async (loanRequestId) => {
      if (!apiClient) throw new Error('API client not initialized');
      await apiClient.patch(`/loan-requests/${loanRequestId}/bantotal-check`, {
        bantotalChecked: true
      });
    }
  });
};

export const useLoanRequests = (
  apiClient: AxiosInstance | undefined,
  params?: LoanRequestListingParams,
  enabled: boolean = true
): UseQueryResult<LoanRequest[], Error> => {
  return useQuery({
    queryKey: [LOAN_REQUESTS_KEY, params],
    queryFn: async (): Promise<LoanRequest[]> => {
      if (!apiClient) throw new Error('API client not initialized');

      const queryParams = new URLSearchParams();

      if (params?.viewAll) {
        queryParams.append('viewAll', String(params.viewAll));
      }

      if (params?.dni) {
        queryParams.append('dni', params.dni);
      }

      if (params?.dealership && params.dealership.trim() !== '') {
        queryParams.append('dealership', params.dealership);
      }

      if (params?.manager) {
        queryParams.append('manager', params.manager);
      }

      const queryString = queryParams.toString();
      const url = `/loan-requests${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<LoanRequest[]>(url);

      let filteredData = response.data;

      if (params?.dni && params.dni.trim() !== '') {
        const dniValue = params.dni.trim().toLowerCase();
        filteredData = filteredData.filter((loan) => {
          if (!loan.dni) return false;
          const dniMatch = loan.dni.toLowerCase().includes(dniValue);
          return dniMatch;
        });
      }

      if (params?.dealership && params.dealership.trim() !== '') {
        const dealershipIds = params.dealership.split('.');
        filteredData = filteredData.filter((loan) =>
          dealershipIds.includes(loan.dealershipId)
        );
      }

      if (params?.manager && params.manager.trim() !== '') {
        const managerNames = params.manager.split('.');
        filteredData = filteredData.filter((loan) =>
          managerNames.includes(loan.managerName)
        );
      }

      return filteredData;
    },
    enabled: !!apiClient && enabled
  });
};

export const useLoanRequestDetail = (
  apiClient: AxiosInstance | undefined,
  id: string,
  enabled: boolean = true
): UseQueryResult<LoanRequestDetail, Error> => {
  return useQuery({
    queryKey: [LOAN_REQUESTS_KEY, 'detail', id],
    queryFn: async (): Promise<LoanRequestDetail> => {
      if (!apiClient) throw new Error('API client not initialized');
      if (!id) throw new Error('Loan request ID is required');

      const response = await apiClient.get<LoanRequestDetail>(
        `/loan-requests/${id}`
      );
      return response.data;
    },
    enabled: !!apiClient && !!id && enabled
  });
};
