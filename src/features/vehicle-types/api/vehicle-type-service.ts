import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult
} from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { CreateVehicleTypeForm, VehicleType } from 'types/VehicleTypes';

const VEHICLE_TYPES_KEY = 'vehicleTypes';

export const useVehicleTypes = (
  apiClient: AxiosInstance | undefined,
  enabled: boolean = true
): UseQueryResult<VehicleType[], Error> => {
  return useQuery({
    queryKey: [VEHICLE_TYPES_KEY],
    queryFn: async (): Promise<VehicleType[]> => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.get<VehicleType[]>('/vehicle-types');
      return response.data;
    },
    enabled: !!apiClient && enabled
  });
};

export const useCreateVehicleType = (apiClient: AxiosInstance | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, CreateVehicleTypeForm>({
    mutationFn: async (vehicleType: CreateVehicleTypeForm) => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.post<string>(
        '/vehicle-types/create',
        vehicleType
      );
      return response.data; // Returns Guid as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VEHICLE_TYPES_KEY] });
    }
  });
};

export const useUpdateVehicleType = (apiClient: AxiosInstance | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, Partial<VehicleType> & { id: string }>({
    mutationFn: async (vehicleTypeUpdate): Promise<boolean> => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.put<boolean>(
        `/vehicle-types/update/${vehicleTypeUpdate.id}`,
        vehicleTypeUpdate
      );
      return response.data; // Returns true/false
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VEHICLE_TYPES_KEY] });
    }
  });
};

// export const useDeleteVehicleType = (apiClient: AxiosInstance | undefined) => {
//   const queryClient = useQueryClient();

//   return useMutation<boolean, Error, string>({
//     mutationFn: async (id: string) => {
//       if (!apiClient) throw new Error('API client not initialized');
//       const response = await apiClient.delete<boolean>(
//         `/vehicle-types/delete/${id}`
//       );
//       return response.data; // Returns true/false
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: [VEHICLE_TYPES_KEY] });
//     }
//   });
// };
