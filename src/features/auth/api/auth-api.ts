import { AxiosInstance } from 'axios';
import { AuthResponse, LoginPayload } from 'types/AuthTypes';

export async function loginUser(
  apiClient: AxiosInstance,
  credentials: LoginPayload
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    '/auth/login',
    credentials
  );
  return response.data;
}
