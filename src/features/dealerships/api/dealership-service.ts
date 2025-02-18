import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult
} from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { Dealership, DealershipForm } from 'types/Dealerships';

const DEALERSHIPS_KEY = 'dealerships';

export const useDealerships = (
  apiClient: AxiosInstance | undefined
): UseQueryResult<Dealership[], Error> => {
  return useQuery({
    queryKey: [DEALERSHIPS_KEY],
    queryFn: async (): Promise<Dealership[]> => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.get<Dealership[]>('/dealerships');
      return response.data;
    },
    //staleTime: 8 * 60 * 60 * 1000, // 8 horas
    //gcTime: 7 * 24 * 60 * 60 * 1000, // 7 días
    enabled: !!apiClient
  });
};

export const useCreateDealership = (apiClient: AxiosInstance | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, DealershipForm>({
    mutationFn: async (dealership: DealershipForm) => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.post<string>(
        '/dealerships/create',
        dealership
      );
      return response.data; // Returns Guid as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEALERSHIPS_KEY] });
    }
  });
};

export const useUpdateDealership = (apiClient: AxiosInstance | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, Dealership>({
    mutationFn: async (dealership: Dealership) => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.put<boolean>(
        `/dealerships/update/${dealership.id}`,
        dealership
      );
      return response.data; // Returns true/false
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEALERSHIPS_KEY] });
    }
  });
};

export const useDeleteDealership = (apiClient: AxiosInstance | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string) => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.delete<boolean>(
        `/dealerships/delete/${id}`
      );
      return response.data; // Returns true/false
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEALERSHIPS_KEY] });
    }
  });
};
