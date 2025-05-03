import { useEffect, useState } from 'react';
import { useToken } from '@/features/auth/TokenContext';
import chatService from './SignalRChatService';

/**
 * Hook para obtener una instancia del servicio de chat
 * Garantiza que solo se cree una instancia del servicio
 */
export function useChatServiceInstance() {
  const { accessToken } = useToken();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!accessToken || isInitialized) return;

    // Inicializar el servicio con el token de acceso
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      chatService.init(apiUrl, accessToken);
      chatService.start(accessToken).catch((err) => {
        console.error('Error iniciando conexión SignalR:', err);
      });
      setIsInitialized(true);
    }

    return () => {
      // Limpiar cuando el componente se desmonte
      chatService.stop().catch((err) => {
        console.error('Error deteniendo conexión SignalR:', err);
      });
    };
  }, [accessToken, isInitialized]);

  return chatService;
}
