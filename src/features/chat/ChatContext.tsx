'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToken } from '@/features/auth/TokenContext';
import notificationService, {
  ChatMessage,
  ChatNotification
} from '../notifications/SignalRNotificationService';
import { useSendMessage } from './api/chat-service';
import { useQueryClient } from '@tanstack/react-query';

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

    // Subscribe to chat message notifications from the unified service
    const unsubscribe = notificationService.onChatMessage(
      (notification: ChatNotification | ChatMessage) => {
        // Handle the notification about a new message
        if (
          'type' in notification &&
          notification.type === 'NEW_CHAT_MESSAGE'
        ) {
          logDev('New chat message notification received:', notification);

          // Cuando recibimos una notificación de nuevo mensaje, invalida la caché
          // para que la UI se actualice y recupere el mensaje del backend
          queryClient.invalidateQueries({
            queryKey: ['chats', 'messages']
          });
        } else if ('content' in notification) {
          // Handle direct message object (for backward compatibility)
          logDev('Chat message received directly:', notification.content);

          // Invalidate the cache for this loan request's messages
          if (notification.loanRequestId) {
            queryClient.invalidateQueries({
              queryKey: ['chats', 'messages', notification.loanRequestId]
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

      // Notify the receiver about the new message via SignalR
      if (notificationService.isConnected() && result && result.id) {
        await notificationService
          .notifyNewChatMessage(messageData.receiverUserId, result.id)
          .catch((err) =>
            logDevError('Error notifying about new message:', err)
          );
      }

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
