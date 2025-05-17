import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult
} from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { User, CreateUserForm } from 'types/User';

const USERS_KEY = 'users';

export interface UserQueryParams {
  branchCode?: number;
  role?: string;
}

export const useUsers = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true,
  params?: UserQueryParams
): UseQueryResult<User[], Error> => {
  return useQuery({
    queryKey: [USERS_KEY, params],
    queryFn: async (): Promise<User[]> => {
      if (!apiClient) throw new Error('API client not initialized');

      // Construct query parameters if provided
      const queryParams = new URLSearchParams();
      if (params) {
        if (params.branchCode !== undefined) {
          queryParams.append('branchCode', params.branchCode.toString());
        }
        if (params.role) {
          queryParams.append('role', params.role);
        }
      }

      const queryString = queryParams.toString();
      const url = `/users${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<User[]>(url);
      return response.data;
    },
    enabled: !!apiClient && enabled
  });
};

export const useSyncCofisaUsers = (apiClient: AxiosInstance | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error>({
    mutationFn: async (): Promise<boolean> => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.post<boolean>(
        '/users/sync-cofisa-users'
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    }
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

export const useResendSetupEmail = (apiClient: AxiosInstance | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: async (id: string) => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.post<boolean>(
        `/users/resend-setup-email/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_KEY] });
    }
  });
};
