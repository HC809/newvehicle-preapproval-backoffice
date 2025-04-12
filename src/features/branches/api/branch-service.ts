import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';

export interface Branch {
  codSuc: number;
  nombre: string;
  direccion: string;
  telefono: string;
  departamento: string;
  localidad: string;
  latitud: string;
  longitud: string;
}

const BRANCHES_KEY = 'branches';

export const useBranches = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true
): UseQueryResult<Branch[], Error> => {
  return useQuery({
    queryKey: [BRANCHES_KEY],
    queryFn: async (): Promise<Branch[]> => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.get<Branch[]>('/branches');
      return response.data;
    },
    enabled: !!apiClient && enabled
  });
};
