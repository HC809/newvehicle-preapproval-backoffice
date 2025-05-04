import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxios from '@/hooks/use-axios';
import { ChatMessage } from '@/features/notifications/SignalRNotificationService';

export interface ChatParticipant {
  id: string;
  name: string;
}

// Query key constants
const CHAT_KEY = 'chats';
const CHAT_MESSAGES_ENDPOINT = '/chat/messages';
const CHAT_SEND_ENDPOINT = '/chat/send';
const CHAT_MESSAGE_ENDPOINT = '/chat/message';

// Hook to get messages for a loanRequest
export const useChatMessages = (
  loanRequestId: string | null,
  enabled: boolean = true
) => {
  const apiClient = useAxios();

  return useQuery({
    queryKey: [CHAT_KEY, 'messages', loanRequestId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!apiClient) throw new Error('API client not initialized');
      if (!loanRequestId) throw new Error('LoanRequest ID is required');

      console.log(`Fetching messages for loan request: ${loanRequestId}`);
      const response = await apiClient.get<ChatMessage[]>(
        `${CHAT_MESSAGES_ENDPOINT}/${loanRequestId}`
      );

      console.log(`Received ${response.data?.length || 0} messages`);
      return response.data;
    },
    enabled: !!apiClient && enabled && !!loanRequestId,
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 15000 // refresh every 15 seconds like notifications
  });
};

// Hook to get a single message by ID
export const useGetMessage = () => {
  const apiClient = useAxios();

  return useMutation({
    mutationFn: async ({
      messageId
    }: {
      messageId: string;
    }): Promise<ChatMessage> => {
      if (!apiClient) throw new Error('API client not initialized');
      if (!messageId) throw new Error('Message ID is required');

      console.log(`Fetching message with ID: ${messageId}`);
      const response = await apiClient.get<ChatMessage>(
        `${CHAT_MESSAGE_ENDPOINT}/${messageId}`
      );

      return response.data;
    }
  });
};

// Hook to send a message to a specific participant
export const useSendMessage = () => {
  const apiClient = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loanRequestId,
      content,
      receiverUserId,
      receiverUserName
    }: {
      loanRequestId: string;
      content: string;
      receiverUserId: string;
      receiverUserName: string;
    }): Promise<ChatMessage> => {
      if (!apiClient) throw new Error('API client not initialized');

      console.log(
        `Sending message to ${receiverUserName} for loan request: ${loanRequestId}`
      );
      const response = await apiClient.post<ChatMessage>(CHAT_SEND_ENDPOINT, {
        loanRequestId,
        content,
        receiverUserId,
        receiverUserName
      });

      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: [CHAT_KEY, 'messages', variables.loanRequestId]
      });
    }
  });
};
