import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { LoanRequest, LoanRequestListingParams } from 'types/LoanRequests';

const LOAN_REQUESTS_KEY = 'loanRequests';

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
