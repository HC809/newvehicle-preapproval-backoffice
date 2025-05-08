'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToken } from '@/features/auth/TokenContext';
import notificationService, {
  UnifiedNotification
} from '../notifications/SignalRNotificationService';
import {
  useSendMessage,
  CHAT_KEY,
  CHAT_MESSAGES_KEY
} from './api/chat-service';
import { useQueryClient } from '@tanstack/react-query';
import { LoanNotificationType } from 'types/Notifications';
import { ChatMessage } from 'types/ChatMessage';

// Helper function for development logging
const logDev = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

// Helper function for development error logging
const logDevError = (message: string, error: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, error);
  }
};

// Función para determinar si una notificación es un mensaje de chat
const isChatMessage = (
  notification: UnifiedNotification
): notification is ChatMessage => {
  return (
    'content' in notification &&
    'senderUserId' in notification &&
    'receiverUserId' in notification
  );
};

interface ChatContextProps {
  sendMessage: (messageData: {
    loanRequestId: string;
    content: string;
    receiverUserId: string;
    receiverUserName: string;
  }) => Promise<ChatMessage | void>;
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

  // Set up for chat using the unified notification service
  useEffect(() => {
    if (!accessToken) return;

    // Subscribe to notifications from the unified service and filter for chat messages
    const unsubscribe = notificationService.onNotification(
      (notification: UnifiedNotification) => {
        console.log('Notification received in ChatContext:', notification);

        // Caso 1: Verificar si es una notificación de tipo Message
        if (
          'type' in notification &&
          notification.type === LoanNotificationType.Message
        ) {
          logDev(
            'Chat LoanNotificationType.Message notification received:',
            notification
          );

          // Si tiene loanRequestId, invalidar la consulta específica
          if (notification.loanRequestId) {
            logDev(
              `Invalidating cache for loan request from Message notification: ${notification.loanRequestId}`
            );

            // Invalidar inmediatamente para que la UI se actualice
            queryClient.invalidateQueries({
              queryKey: [
                CHAT_KEY,
                CHAT_MESSAGES_KEY,
                notification.loanRequestId
              ],
              exact: true
            });
          }
        }
        // Caso 2: Verificar si es un mensaje de chat directo (tiene la estructura de ChatMessage)
        else if (isChatMessage(notification)) {
          logDev('Direct chat message notification received:', notification);

          // Solo invalidar si tenemos un loanRequestId específico
          if (notification.loanRequestId) {
            logDev(
              `Invalidating cache for specific loan request from direct message: ${notification.loanRequestId}`
            );

            // Invalidar solo la consulta para este loanRequestId específico
            queryClient.invalidateQueries({
              queryKey: [
                CHAT_KEY,
                CHAT_MESSAGES_KEY,
                notification.loanRequestId
              ],
              exact: true // Asegurarse de que solo se invalida esta consulta exacta
            });
          }
        }
      }
    );

    // Periodic check of connection status without excessive logs
    const connectionCheckInterval = setInterval(() => {
      const connected = notificationService.isConnected();
      setIsConnected(connected);
      setConnectionId(notificationService.getConnectionId());

      // Only log state changes, not every check
      if (connected !== isConnected) {
        logDev(
          `Chat connection status changed to: ${connected ? 'Connected' : 'Disconnected'}`
        );
      }
    }, 10000);

    // Cleanup on unmount
    return () => {
      unsubscribe();
      clearInterval(connectionCheckInterval);
    };
  }, [accessToken, queryClient, isConnected]);

  // Function to send messages
  const sendMessage = async (messageData: {
    loanRequestId: string;
    content: string;
    receiverUserId: string;
    receiverUserName: string;
  }): Promise<ChatMessage | void> => {
    try {
      const result = await sendMessageMutation.mutateAsync(messageData);

      // Invalidar la caché inmediatamente después de enviar un mensaje
      // para que la UI se actualice sin esperar la notificación del servidor
      queryClient.invalidateQueries({
        queryKey: [CHAT_KEY, CHAT_MESSAGES_KEY, messageData.loanRequestId],
        exact: true
      });

      return result;
    } catch (error) {
      logDevError('Error sending chat message:', error);
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
