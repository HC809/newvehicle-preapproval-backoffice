import axios, { AxiosError, AxiosInstance } from 'axios';
import { signOut } from 'next-auth/react';
import { CustomError, ProblemDetails } from 'types/ResponseErrorTypes';

export const createAxiosInstance = (
  accessToken?: string | null
): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    },
    // Aumentar el timeout para desarrollo o eliminarlo
    timeout: process.env.NODE_ENV === 'development' ? 0 : 5000 // 0 significa sin timeout
  });

  // Interceptor de solicitud
  instance.interceptors.request.use(
    async (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor de respuesta
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      let errorMessage = 'Ocurrió un error inesperado';

      // Handle 404 Not Found
      if (error.response?.status === 404) {
        errorMessage =
          'Recurso no encontrado. Por favor, verifica la URL o intenta de nuevo más tarde.';
      }
      // Handle network or connection errors
      else if (error.code === 'ECONNREFUSED') {
        errorMessage =
          'Error de conexión con el servidor. Comuníquese con el administrador.';
      } else if (error.code === 'ERR_NETWORK') {
        const isOnline = navigator?.onLine ?? true;
        errorMessage = isOnline
          ? 'El servicio no está disponible en este momento. Por favor, intente más tarde.'
          : 'Error de red. Por favor, verifica tu conexión a internet.';
      } else if (error.response) {
        const { status, data } = error.response;

        if (status === 401) {
          await signOut();
          errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
        } else if (status === 422 || status === 500) {
          const problemDetails = data as ProblemDetails;
          if (problemDetails.errors) {
            errorMessage = problemDetails.errors
              .map((error) => error.errorMessage)
              .join(', ');
          } else {
            errorMessage = problemDetails.detail || 'Error del servidor.';
          }
        } else if (status === 400) {
          const customError = data as CustomError;
          errorMessage = customError.description || 'Error en la solicitud.';
        }
      }

      // Crear un nuevo error con el mensaje formateado
      const customError = new Error(errorMessage);
      return Promise.reject(customError);
    }
  );

  return instance;
};
