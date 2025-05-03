import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatMessage, ChatRoomType } from '../SignalRChatService';
import { useChatStore } from '@/stores/chat-store';
import useAxios from '@/hooks/use-axios';

export interface ChatRoom {
  id: string;
  name: string;
  type: ChatRoomType;
  loanRequestId: string;
  unreadCount: number;
  lastMessage?: {
    content: string;
    sentAt: string;
    senderName: string;
  };
}

export interface CreateChatRoomRequest {
  loanRequestId: string;
  type: ChatRoomType;
}

// Constantes para claves de consulta
const CHAT_KEY = 'chats';
const CHAT_ROOMS_ENDPOINT = '/chat/rooms';
const CHAT_MESSAGES_ENDPOINT = '/chat/messages';

// Función generadora de IDs determinista para salas de chat (como fallback)
export function generateChatRoomId(
  loanRequestId: string,
  type: ChatRoomType
): string {
  // Simplificar el formato para evitar problemas con caracteres especiales
  return `${type}_${loanRequestId.replace(/[^a-zA-Z0-9]/g, '')}`;
}

// Hook para obtener mensajes de una sala
export const useChatMessages = (
  roomId: string | null,
  enabled: boolean = true
) => {
  const apiClient = useAxios();
  const { addMessages } = useChatStore();

  return useQuery({
    queryKey: [CHAT_KEY, 'messages', roomId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!apiClient) throw new Error('API client not initialized');
      if (!roomId) throw new Error('Room ID is required');

      const response = await apiClient.get<ChatMessage[]>(
        `${CHAT_MESSAGES_ENDPOINT}/${roomId}`
      );

      // Agregar mensajes al store
      addMessages(roomId, response.data);

      return response.data;
    },
    enabled: !!apiClient && enabled && !!roomId,
    staleTime: 10000, // 10 segundos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 15000 // refrescar cada 15 segundos como las notificaciones
  });
};

// Hook para obtener o crear una sala de chat
export const useGetOrCreateChatRoom = () => {
  const apiClient = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateChatRoomRequest): Promise<ChatRoom> => {
      if (!apiClient) throw new Error('API client not initialized');

      // Validar que el loanRequestId sea un GUID válido
      if (!request.loanRequestId || !isValidGuid(request.loanRequestId)) {
        console.error(
          'ID de solicitud inválido o no es un GUID:',
          request.loanRequestId
        );
        throw new Error(
          'El ID de solicitud no es válido. Debe ser un GUID válido.'
        );
      }

      try {
        // Intentar obtener todas las salas existentes para el loanRequestId
        const getRoomUrl = `${CHAT_ROOMS_ENDPOINT}/loan-request/${request.loanRequestId}`;
        console.log(
          'Buscando salas existentes en:',
          getRoomUrl,
          'para tipo:',
          request.type
        );

        const getResponse = await apiClient.get<ChatRoom[]>(getRoomUrl);

        // Filtrar las salas para encontrar la del tipo correcto
        // Asegurarnos de que estamos comparando el tipo correctamente
        const existingRoom = getResponse.data?.find(
          (room) => room.type === request.type
        );

        // Si encontramos una sala del tipo correcto, la devolvemos
        if (existingRoom) {
          console.log('Sala existente encontrada:', existingRoom);
          return existingRoom;
        }

        // Si no existe una sala del tipo correcto, crear una nueva con el tipo correcto
        console.log(
          'Creando nueva sala para:',
          request.loanRequestId,
          'tipo:',
          request.type
        );

        // Asegurarse de que estamos enviando el tipo correcto al backend
        const requestData = {
          loanRequestId: request.loanRequestId,
          type: request.type
        };

        try {
          const createResponse = await apiClient.post<ChatRoom>(
            CHAT_ROOMS_ENDPOINT,
            requestData
          );

          console.log('Nueva sala creada:', createResponse.data);
          return createResponse.data;
        } catch (createError: any) {
          console.error(
            'Error específico al crear sala:',
            createError?.response?.data || createError
          );
          throw new Error(
            `Error al crear sala de chat: ${createError?.response?.data?.message || createError.message}`
          );
        }
      } catch (error: any) {
        console.error('Error al obtener/crear sala:', error);
        throw new Error(
          `Error al obtener/crear sala de chat: ${error?.response?.data?.message || error.message}`
        );
      }
    },
    onSuccess: (data) => {
      // Invalidar consultas relacionadas con salas de chat
      queryClient.invalidateQueries({ queryKey: [CHAT_KEY, 'rooms'] });

      // También invalidar consultas específicas para esta sala
      if (data && data.id) {
        queryClient.invalidateQueries({
          queryKey: [CHAT_KEY, 'messages', data.id]
        });
      }
    }
  });
};

// Función auxiliar para validar si un string es un GUID válido
function isValidGuid(id: string): boolean {
  const guidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidRegex.test(id);
}

// Hook para marcar todos los mensajes de una sala como leídos
export const useMarkAllAsRead = () => {
  const apiClient = useAxios();
  const queryClient = useQueryClient();
  const { markRoomAsRead } = useChatStore();

  return useMutation({
    mutationFn: async (roomId: string): Promise<void> => {
      if (!apiClient) throw new Error('API client not initialized');

      // Marcar como leídos en el store local para UI inmediata
      markRoomAsRead(roomId);

      // NOTA: La API no tiene un endpoint para marcar mensajes como leídos,
      // así que solo actualizamos la UI localmente

      // No llamamos al endpoint que no existe:
      // await apiClient.put(`${CHAT_MESSAGES_ENDPOINT}/${roomId}/read`);

      // Devolver una promesa resuelta
      return Promise.resolve();
    },
    onSuccess: (_, roomId) => {
      // Invalidar consultas relacionadas
      queryClient.invalidateQueries({
        queryKey: [CHAT_KEY, 'messages', roomId]
      });
      queryClient.invalidateQueries({ queryKey: [CHAT_KEY, 'rooms'] });
    }
  });
};

// Hook para enviar un mensaje
export const useSendMessage = () => {
  const apiClient = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roomId,
      content
    }: {
      roomId: string;
      content: string;
    }): Promise<ChatMessage> => {
      if (!apiClient) throw new Error('API client not initialized');

      const response = await apiClient.post<ChatMessage>(
        CHAT_MESSAGES_ENDPOINT,
        { chatRoomId: roomId, content }
      );

      return response.data;
    },
    onSuccess: (data) => {
      // Invalidar consultas relacionadas
      queryClient.invalidateQueries({
        queryKey: [CHAT_KEY, 'messages', data.chatRoomId]
      });
      queryClient.invalidateQueries({ queryKey: [CHAT_KEY, 'rooms'] });
    }
  });
};

// Hook para obtener todas las salas de chat de un usuario
export const useChatRooms = (enabled: boolean = true) => {
  const apiClient = useAxios();

  return useQuery({
    queryKey: [CHAT_KEY, 'rooms'],
    queryFn: async (): Promise<ChatRoom[]> => {
      if (!apiClient) throw new Error('API client not initialized');

      const response = await apiClient.get<ChatRoom[]>(CHAT_ROOMS_ENDPOINT);
      return response.data;
    },
    enabled: !!apiClient && enabled,
    staleTime: 15000, // 15 segundos
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
};

// Hook para obtener las salas de chat de una solicitud de préstamo
export const useLoanRequestChatRooms = (
  loanRequestId: string,
  enabled: boolean = true
) => {
  const apiClient = useAxios();

  return useQuery({
    queryKey: [CHAT_KEY, 'loanRequest', loanRequestId],
    queryFn: async (): Promise<ChatRoom[]> => {
      if (!apiClient) throw new Error('API client not initialized');

      const response = await apiClient.get<ChatRoom[]>(
        `${CHAT_ROOMS_ENDPOINT}/loan-request/${loanRequestId}`
      );

      return response.data;
    },
    enabled: !!apiClient && !!loanRequestId && enabled,
    staleTime: 15000, // 15 segundos
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
};

// Función auxiliar para obtener el nombre de la sala según su tipo
function getChatRoomName(type: ChatRoomType): string {
  switch (type) {
    case ChatRoomType.Agent_Creator:
      return 'Chat con Concesionario';
    case ChatRoomType.Agent_Manager:
      return 'Chat con Administrador';
    case ChatRoomType.Agent_PYMEAdvisor:
      return 'Chat con Asesor PYME';
    case ChatRoomType.Agent_BranchManager:
      return 'Chat con Gerente';
    case ChatRoomType.Creator_PYMEAdvisor:
      return 'Chat con Asesor PYME';
    case ChatRoomType.All_Participants:
      return 'Chat grupal';
    default:
      return 'Chat';
  }
}
