import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult
} from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import {
  CompanyConfiguration,
  CreateCompanyConfigurationForm
} from 'types/CompanyConfigurations';

const COMPANY_CONFIGURATIONS_KEY = 'companyConfigurations';

export const useCompanyConfigurations = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true
): UseQueryResult<CompanyConfiguration[], Error> => {
  return useQuery({
    queryKey: [COMPANY_CONFIGURATIONS_KEY],
    queryFn: async (): Promise<CompanyConfiguration[]> => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.get<CompanyConfiguration[]>(
        '/companyconfigurations'
      );
      return response.data;
    },
    enabled: !!apiClient && enabled
  });
};

export const useCreateCompanyConfiguration = (
  apiClient: AxiosInstance | undefined
) => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, CreateCompanyConfigurationForm>({
    mutationFn: async (configuration: CreateCompanyConfigurationForm) => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.post<string>(
        '/companyconfigurations/create',
        configuration
      );
      return response.data; // Returns Guid as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANY_CONFIGURATIONS_KEY] });
    }
  });
};
