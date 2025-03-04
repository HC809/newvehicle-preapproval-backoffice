import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult
} from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { User, CreateUserForm } from 'types/User';

const USERS_KEY = 'users';

export const useUsers = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true // Add the enabled parameter with default value of true
): UseQueryResult<User[], Error> => {
  return useQuery({
    queryKey: [USERS_KEY],
    queryFn: async (): Promise<User[]> => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.get<User[]>('/users');
      return response.data;
    },
    enabled: !!apiClient && enabled // Only run the query when API client is available and enabled is true
  });
};

export const useCreateUser = (apiClient: AxiosInstance | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, CreateUserForm>({
    mutationFn: async (user: CreateUserForm): Promise<User> => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.post<User>('/users/create', user);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    }
  });
};

export const useUpdateUser = (apiClient: AxiosInstance | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, Partial<User> & { id: string }>({
    mutationFn: async (userUpdate): Promise<User> => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.put<User>(
        `/users/update/${userUpdate.id}`,
        userUpdate
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    }
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

export const useRestoreUser = (apiClient: AxiosInstance | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string) => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.put<boolean>(`/users/restore/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    }
  });
};
