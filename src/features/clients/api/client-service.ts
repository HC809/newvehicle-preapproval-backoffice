import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { Client } from 'types/Client';

const CLIENTS_KEY = 'clients';

export const useClients = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true
): UseQueryResult<Client[], Error> => {
  return useQuery({
    queryKey: [CLIENTS_KEY],
    queryFn: async (): Promise<Client[]> => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.get<Client[]>('/clients');
      return response.data;
    },
    enabled: !!apiClient && enabled
  });
};

export const useClientDetail = (
  apiClient: AxiosInstance | undefined,
  id: string,
  enabled: boolean = true
): UseQueryResult<Client, Error> => {
  return useQuery({
    queryKey: [CLIENTS_KEY, id],
    queryFn: async (): Promise<Client> => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.get<Client>(`/clients/${id}`);
      return response.data;
    },
    enabled: !!apiClient && !!id && enabled
  });
};
