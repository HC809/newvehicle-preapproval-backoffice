'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode
} from 'react';
import { useToken } from '@/features/auth/TokenContext';
import chatService from './SignalRChatService';
import { toast } from 'sonner';
import { useChatStore } from '@/stores/chat-store';
import {
  useChatRooms,
  useMarkAllAsRead,
  useSendMessage
} from './api/chat-service';
import { useQueryClient } from '@tanstack/react-query';

// Tipo para el estado de conexión
type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

interface ChatContextProps {
  chatRooms: any[];
  isLoading: boolean;
  hasError: boolean;
  unreadCount: number;
  sendMessage: (roomId: string, content: string) => Promise<void>;
  markRoomAsRead: (roomId: string) => Promise<void>;
  refreshChatRooms: () => Promise<void>;
  connectionStatus: ConnectionStatus;
}

const ChatContext = createContext<ChatContextProps>({
  chatRooms: [],
  isLoading: false,
  hasError: false,
  unreadCount: 0,
  sendMessage: async () => {},
  markRoomAsRead: async () => {},
  refreshChatRooms: async () => {},
  connectionStatus: 'disconnected'
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useToken();
  const { addMessage } = useChatStore();
  const [hasError, setHasError] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('disconnected');
  const queryClient = useQueryClient();

  // Mutation para enviar mensajes
  const sendMessageMutation = useSendMessage();

  // Mutation para marcar mensajes como leídos
  const markAsReadMutation = useMarkAllAsRead();

  // Usar el hook de React Query para obtener salas de chat
  const {
    data: chatRooms = [],
    isLoading,
    refetch,
    isError
  } = useChatRooms(!!accessToken);

  // Actualizar estado de error cuando hay un error en la query
  useEffect(() => {
    setHasError(isError);
  }, [isError]);

  // Configurar SignalR
  useEffect(() => {
    if (!accessToken) return;

    let retryCount = 0;
    const maxRetries = 3;
    let retryTimeout: NodeJS.Timeout;

    const initializeSignalR = async () => {
      try {
        setConnectionStatus('connecting');

        // Iniciar conexión (con URL de la API)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('API URL no definida');
        }

        chatService.init(apiUrl, accessToken);
        await chatService.start(accessToken);
        setConnectionStatus('connected');

        // Suscribirse a mensajes
        const unsubscribe = chatService.onMessage((message) => {
          console.log('Mensaje recibido en el chat:', message);

          // Añadir mensaje al store
          addMessage(message);

          // Extraer el userId del token para comparar
          let currentUserId: string | null = null;
          try {
            const tokenParts = accessToken.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              currentUserId = payload.UserId || payload.sub || payload.nameid;
            }
          } catch (e) {
            console.error('Error al extraer userId del token', e);
          }

          // Mostrar notificación si el mensaje no es propio
          if (message.senderId !== currentUserId) {
            toast.info(`Nuevo mensaje de ${message.senderName}`, {
              description:
                message.content.length > 50
                  ? `${message.content.substring(0, 50)}...`
                  : message.content,
              duration: 5000,
              action: {
                label: 'Ver',
                onClick: () => {
                  // Navegar a la sala de chat o abrir el popover
                  queryClient.invalidateQueries({
                    queryKey: ['chats', 'messages', message.chatRoomId]
                  });
                }
              }
            });
          }

          // Invalidar consultas relacionadas
          queryClient.invalidateQueries({
            queryKey: ['chats', 'messages', message.chatRoomId]
          });
          queryClient.invalidateQueries({
            queryKey: ['chats', 'rooms']
          });
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error al inicializar SignalR:', error);
        setConnectionStatus('error');

        // Reintentar
        if (retryCount < maxRetries) {
          retryCount++;

          return new Promise<() => void>((resolve) => {
            retryTimeout = setTimeout(async () => {
              const unsubscribe = await initializeSignalR();
              resolve(unsubscribe);
            }, 2000 * retryCount);
          });
        }

        return () => {};
      }
    };

    let unsubscribeFunc: (() => void) | undefined;

    initializeSignalR()
      .then((unsubscribe) => {
        unsubscribeFunc = unsubscribe;
      })
      .catch((error) => {
        console.error('Error durante la inicialización de SignalR:', error);
        setConnectionStatus('error');
      });

    return () => {
      if (unsubscribeFunc) unsubscribeFunc();
      chatService.stop().catch(() => {});
      clearTimeout(retryTimeout);
      setConnectionStatus('disconnected');
    };
  }, [accessToken, addMessage, queryClient]);

  // Función para enviar un mensaje
  const sendMessage = useCallback(
    async (roomId: string, content: string) => {
      if (!roomId || !content.trim()) {
        throw new Error(
          'Se requiere un ID de sala y contenido para enviar un mensaje'
        );
      }

      try {
        await sendMessageMutation.mutateAsync({ roomId, content });
      } catch (error) {
        console.error('Error al enviar mensaje:', error);
        throw error;
      }
    },
    [sendMessageMutation]
  );

  // Función para marcar un chat como leído
  const markRoomAsRead = useCallback(
    async (roomId: string) => {
      if (!roomId) return;

      try {
        await markAsReadMutation.mutateAsync(roomId);
      } catch (error) {
        console.error('Error al marcar como leído:', error);
      }
    },
    [markAsReadMutation]
  );

  // Función para refrescar las salas de chat
  const refreshChatRooms = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Obtener contador total de mensajes no leídos
  const { unreadCountByRoom } = useChatStore();
  const totalUnreadCount = Object.values(unreadCountByRoom).reduce(
    (acc, count) => acc + count,
    0
  );

  // Memoizar el valor del contexto
  const contextValue = useMemo(
    () => ({
      chatRooms,
      isLoading,
      hasError,
      unreadCount: totalUnreadCount,
      sendMessage,
      markRoomAsRead,
      refreshChatRooms,
      connectionStatus
    }),
    [
      chatRooms,
      isLoading,
      hasError,
      totalUnreadCount,
      sendMessage,
      markRoomAsRead,
      refreshChatRooms,
      connectionStatus
    ]
  );

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
