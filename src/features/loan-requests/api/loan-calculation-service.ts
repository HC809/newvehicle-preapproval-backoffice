import { useMutation } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';

export const useCalculateLoan = (apiClient: AxiosInstance) => {
  return useMutation({
    mutationFn: async (loanRequestId: string) => {
      const response = await apiClient.post(
        `/loan-calculations/calculate/${loanRequestId}`
      );
      return response.data;
    }
  });
};
