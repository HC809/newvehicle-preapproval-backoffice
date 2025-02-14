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
    timeout: 5000
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
      // Handle 404 Not Found
      if (error.response?.status === 404) {
        const errorMessage =
          'Recurso no encontrado. Por favor, verifica la URL o intenta de nuevo más tarde.';
        return Promise.reject(errorMessage);
      }

      // Handle network or connection errors
      if (error.code === 'ECONNREFUSED') {
        const errorMessage =
          'Error de conexión con el servidor. Comuníquese con el administrador.';
        return Promise.reject(errorMessage);
      }

      if (error.code === 'ERR_NETWORK') {
        const isOnline = navigator?.onLine ?? true;
        const errorMessage = isOnline
          ? 'El servicio no está disponible en este momento. Por favor, intente más tarde o comuníquese con el administrador.'
          : 'Error de red. Por favor, verifica tu conexión a internet.';
        return Promise.reject(errorMessage);
      }

      if (error.response) {
        const { status, data } = error.response;

        //Unauthorized access
        if (status === 401) {
          await signOut();
          // const errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
          // return Promise.reject(errorMessage);
        }

        // Unprocessable Entity (Validation errors) or Internal Server Error
        if (status === 422 || status === 500) {
          const problemDetails = data as ProblemDetails;
          if (problemDetails.errors) {
            const errorMessages = problemDetails.errors
              .map((error) => error.errorMessage)
              .join(', ');
            return Promise.reject(
              errorMessages || problemDetails.detail || 'Error desconocido.'
            );
          }
          return Promise.reject(problemDetails.detail || 'Error desconocido.');
        }

        // Bad Request
        if (status === 400) {
          const customError = data as CustomError;
          const errorMessage =
            customError.description || 'Error en la solicitud.';
          return Promise.reject(errorMessage);
        }
      }

      return Promise.reject(error?.message || 'Ocurrió un error inesperado.');
    }
  );

  return instance;
};
