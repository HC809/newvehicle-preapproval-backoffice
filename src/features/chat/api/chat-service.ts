import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatMessage } from '../SignalRChatService';
import useAxios from '@/hooks/use-axios';

export interface ChatParticipant {
  id: string;
  name: string;
}

// Constantes para claves de consulta
const CHAT_KEY = 'chats';
const CHAT_MESSAGES_ENDPOINT = '/chat/messages';
const CHAT_SEND_ENDPOINT = '/chat/send';

// Hook para obtener mensajes de un loanRequest
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
    staleTime: 10000, // 10 segundos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 15000 // refrescar cada 15 segundos como las notificaciones
  });
};

// Hook para enviar un mensaje a un participante específico
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
      // Invalidar consultas relacionadas
      queryClient.invalidateQueries({
        queryKey: [CHAT_KEY, 'messages', variables.loanRequestId]
      });
    }
  });
};
