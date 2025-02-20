import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult
} from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { User } from 'types/User';

const USERS_KEY = 'users';

export const useUsers = (
  apiClient: AxiosInstance | undefined
): UseQueryResult<User[], Error> => {
  return useQuery({
    queryKey: [USERS_KEY],
    queryFn: async (): Promise<User[]> => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.get<User[]>('/users');
      return response.data;
    },
    enabled: !!apiClient
  });
};

export const useDeleteUser = (apiClient: AxiosInstance | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string) => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.delete<boolean>(`/users/delete/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    }
  });
};
