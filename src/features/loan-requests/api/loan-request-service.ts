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

      let url = '/loan-requests';
      if (params?.viewAll) {
        url += `?viewAll=${params.viewAll}`;
      }

      const response = await apiClient.get<LoanRequest[]>(url);
      return response.data;
    },
    enabled: !!apiClient && enabled
  });
};
