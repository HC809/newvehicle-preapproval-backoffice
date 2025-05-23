import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult
} from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { CreateDelaershipForm, Dealership } from 'types/Dealerships';

const DEALERSHIPS_KEY = 'dealerships';
const USERS_KEY = 'users'; // Added USERS_KEY for invalidating users queries

export const useDealerships = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true // Añadir parámetro enabled con valor por defecto
): UseQueryResult<Dealership[], Error> => {
  return useQuery({
    queryKey: [DEALERSHIPS_KEY],
    queryFn: async (): Promise<Dealership[]> => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.get<Dealership[]>('/dealerships');
      return response.data;
    },
    enabled: !!apiClient && enabled // Modificar la condición enabled
  });
};

export const useCreateDealership = (apiClient: AxiosInstance | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, CreateDelaershipForm>({
    mutationFn: async (dealership: CreateDelaershipForm) => {
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

  return useMutation<boolean, Error, Partial<Dealership> & { id: string }>({
    mutationFn: async (dealershipUpdate): Promise<boolean> => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.put<boolean>(
        `/dealerships/update/${dealershipUpdate.id}`,
        dealershipUpdate
      );
      return response.data; // Returns true/false
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEALERSHIPS_KEY] });
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
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
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    }
  });
};

export const useRestoreDealership = (apiClient: AxiosInstance | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string) => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.put<boolean>(
        `/dealerships/restore/${id}`
      );
      return response.data; // Returns true/false
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DEALERSHIPS_KEY] });
    }
  });
};
