'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToken } from '@/features/auth/TokenContext';
import chatService, { ChatMessage } from './SignalRChatService';
import { useSendMessage } from './api/chat-service';
import { useQueryClient } from '@tanstack/react-query';

interface ChatContextProps {
  sendMessage: (messageData: {
    loanRequestId: string;
    content: string;
    receiverUserId: string;
    receiverUserName: string;
  }) => Promise<void>;
  isConnected: boolean;
  connectionId: string | null;
}

const ChatContext = createContext<ChatContextProps>({
  sendMessage: async () => {},
  isConnected: false,
  connectionId: null
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { accessToken } = useToken();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const sendMessageMutation = useSendMessage();

  // Configurar SignalR para el chat
  useEffect(() => {
    if (!accessToken) return;

    let retryCount = 0;
    const maxRetries = 3;
    let retryTimeout: NodeJS.Timeout;

    const initializeChatSignalR = async () => {
      try {
        // Iniciar conexión
        await chatService.start(accessToken);

        // Actualizar estado de conexión
        setIsConnected(chatService.isConnected());
        setConnectionId(chatService.getConnectionId());

        // Suscribirse a mensajes de chat
        const unsubscribe = chatService.onMessage((message) => {
          console.log('Chat message received:', message.content);

          // Invalidar la caché de mensajes para esta solicitud
          queryClient.invalidateQueries({
            queryKey: ['chats', 'messages', message.loanRequestId]
          });
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error initializing chat SignalR:', error);

        // Reintentar un número limitado de veces
        if (retryCount < maxRetries) {
          retryCount++;

          // Esperar antes de reintentar (con backoff exponencial)
          return new Promise<() => void>((resolve) => {
            retryTimeout = setTimeout(async () => {
              const unsubscribe = await initializeChatSignalR();
              resolve(unsubscribe);
            }, retryCount * 3000);
          });
        }

        return () => {};
      }
    };

    // Iniciar SignalR y obtener la función de limpieza
    let unsubscribeFunc: (() => void) | undefined;

    initializeChatSignalR().then((unsubscribe) => {
      unsubscribeFunc = unsubscribe;

      // Verificar y actualizar estado de conexión
      setIsConnected(chatService.isConnected());
      setConnectionId(chatService.getConnectionId());
    });

    // Comprobación periódica del estado de conexión
    const connectionCheckInterval = setInterval(() => {
      setIsConnected(chatService.isConnected());
      setConnectionId(chatService.getConnectionId());
    }, 10000);

    // Limpiar al desmontar
    return () => {
      if (unsubscribeFunc) unsubscribeFunc();
      chatService.stop();
      clearTimeout(retryTimeout);
      clearInterval(connectionCheckInterval);
    };
  }, [accessToken, queryClient]);

  // Función para enviar mensajes
  const sendMessage = async (messageData: {
    loanRequestId: string;
    content: string;
    receiverUserId: string;
    receiverUserName: string;
  }) => {
    try {
      await sendMessageMutation.mutateAsync(messageData);
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        sendMessage,
        isConnected,
        connectionId
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
