import { useQuery } from '@tanstack/react-query';

export function useCities(apiClient: any) {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await apiClient.post(
        'https://countriesnow.space/api/v0.1/countries/cities',
        {
          country: 'honduras'
        }
      );
      return response.data.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24 // 24 hours
  });
}
