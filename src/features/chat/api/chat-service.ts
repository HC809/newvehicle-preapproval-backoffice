import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxios from '@/hooks/use-axios';
import { ChatMessage } from 'types/ChatMessage';

// Query key constants - exportados para ser usados en otros archivos
export const CHAT_KEY = 'chats';
export const CHAT_MESSAGES_KEY = 'messages';
const CHAT_MESSAGES_ENDPOINT = '/chat/messages';
const CHAT_SEND_ENDPOINT = '/chat/send';

// Hook to get messages for a loanRequest
export const useChatMessages = (
  loanRequestId: string | null,
  enabled: boolean = true
) => {
  const apiClient = useAxios();

  return useQuery({
    queryKey: [CHAT_KEY, CHAT_MESSAGES_KEY, loanRequestId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!apiClient) throw new Error('API client not initialized');
      if (!loanRequestId) throw new Error('LoanRequest ID is required');

      const response = await apiClient.get<ChatMessage[]>(
        `${CHAT_MESSAGES_ENDPOINT}/${loanRequestId}`
      );

      return response.data;
    },
    enabled: !!apiClient && enabled && !!loanRequestId,
    staleTime: 10000, // 10 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true
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

      // Enviar solo las propiedades requeridas
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
        queryKey: [CHAT_KEY, CHAT_MESSAGES_KEY, variables.loanRequestId],
        exact: true
      });
    }
  });
};
