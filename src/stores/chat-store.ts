import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ChatMessage } from '@/features/chat/SignalRChatService';

// Interfaz para el store de chat
export interface ChatStore {
  // Mensajes por sala
  messagesByRoom: Record<string, ChatMessage[]>;

  // Contadores de mensajes no leídos por sala
  unreadCountByRoom: Record<string, number>;

  // Contadores antiguos (mantener para compatibilidad)
  messages: Record<string, ChatMessage[]>;
  unreadCountByLoanRequest: Record<string, number>;

  // Contadores totales
  totalUnreadCount: number;

  // Acciones
  addMessage: (roomId: string, message: ChatMessage) => void;
  addMessages: (roomId: string, messages: ChatMessage[]) => void;
  markRoomAsRead: (roomId: string) => void;
  clearChat: (roomId: string) => void;
  clearAllChats: () => void;
}

let store: ReturnType<typeof createStore>;

function createStore() {
  return create<ChatStore>()(
    devtools(
      persist(
        (set) => ({
          messages: {},
          unreadCountByLoanRequest: {},
          totalUnreadCount: 0,
          messagesByRoom: {},
          unreadCountByRoom: {},

          addMessage: (roomId, message) =>
            set(
              (state) => {
                const currentMessages = state.messagesByRoom[roomId] || [];

                // Verificar si el mensaje ya existe
                if (currentMessages.some((m) => m.id === message.id)) {
                  return state;
                }

                // Añadir el mensaje a la sala correspondiente
                const updatedMessages = [...currentMessages, message];

                // Actualizar contadores de no leídos - considera todos los mensajes nuevos como no leídos
                const currentUnreadCount = state.unreadCountByRoom[roomId] || 0;
                const newUnreadCount = currentUnreadCount + 1;

                // Calcular total de no leídos
                let totalUnread = 0;
                const updatedUnreadCountByRoom = {
                  ...state.unreadCountByRoom,
                  [roomId]: newUnreadCount
                };

                // Sumar todos los no leídos
                Object.values(updatedUnreadCountByRoom).forEach((count) => {
                  totalUnread += count;
                });

                return {
                  messagesByRoom: {
                    ...state.messagesByRoom,
                    [roomId]: updatedMessages
                  },
                  unreadCountByRoom: updatedUnreadCountByRoom,
                  totalUnreadCount: totalUnread,
                  messages: state.messages,
                  unreadCountByLoanRequest: state.unreadCountByLoanRequest
                };
              },
              false,
              'chat/addMessage'
            ),

          addMessages: (roomId, messages) =>
            set(
              (state) => {
                const currentMessages = state.messagesByRoom[roomId] || [];

                // Filtrar mensajes duplicados
                const newMessages = messages.filter(
                  (newMsg) =>
                    !currentMessages.some(
                      (existingMsg) => existingMsg.id === newMsg.id
                    )
                );

                if (newMessages.length === 0) {
                  return state;
                }

                // Combinar mensajes existentes con nuevos y ordenar por fecha
                const updatedMessages = [
                  ...currentMessages,
                  ...newMessages
                ].sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                );

                // Todos los mensajes nuevos se consideran no leídos
                const newUnreadCount = newMessages.length;

                // Actualizar contador de no leídos para esta sala
                const currentUnreadCount = state.unreadCountByRoom[roomId] || 0;
                const updatedUnreadCount = currentUnreadCount + newUnreadCount;

                // Calcular total de no leídos
                let totalUnread = 0;
                const updatedUnreadCountByRoom = {
                  ...state.unreadCountByRoom,
                  [roomId]: updatedUnreadCount
                };

                Object.values(updatedUnreadCountByRoom).forEach((count) => {
                  totalUnread += count;
                });

                return {
                  messagesByRoom: {
                    ...state.messagesByRoom,
                    [roomId]: updatedMessages
                  },
                  unreadCountByRoom: updatedUnreadCountByRoom,
                  totalUnreadCount: totalUnread,
                  messages: state.messages,
                  unreadCountByLoanRequest: state.unreadCountByLoanRequest
                };
              },
              false,
              'chat/addMessages'
            ),

          markRoomAsRead: (roomId) =>
            set(
              (state) => {
                // Si no hay mensajes no leídos para esta sala, no hacer nada
                if (
                  !state.unreadCountByRoom[roomId] ||
                  state.unreadCountByRoom[roomId] === 0
                ) {
                  return state;
                }

                // Calcular nuevo total de no leídos
                const oldRoomUnreadCount = state.unreadCountByRoom[roomId] || 0;
                const newTotalUnread =
                  state.totalUnreadCount - oldRoomUnreadCount;

                // Actualizar contadores de no leídos
                const updatedUnreadCountByRoom = {
                  ...state.unreadCountByRoom,
                  [roomId]: 0
                };

                return {
                  messagesByRoom: state.messagesByRoom,
                  unreadCountByRoom: updatedUnreadCountByRoom,
                  totalUnreadCount: newTotalUnread,
                  messages: state.messages,
                  unreadCountByLoanRequest: state.unreadCountByLoanRequest
                };
              },
              false,
              'chat/markRoomAsRead'
            ),

          clearChat: (roomId) =>
            set(
              (state) => {
                // Eliminar mensajes de esta sala
                const { [roomId]: _, ...restMessages } = state.messagesByRoom;

                // Actualizar contadores de no leídos
                const roomUnreadCount = state.unreadCountByRoom[roomId] || 0;
                const { [roomId]: __, ...restUnreadCounts } =
                  state.unreadCountByRoom;

                // Calcular nuevo total de no leídos
                const newTotalUnread = state.totalUnreadCount - roomUnreadCount;

                return {
                  messagesByRoom: restMessages,
                  unreadCountByRoom: restUnreadCounts,
                  totalUnreadCount: newTotalUnread,
                  messages: state.messages,
                  unreadCountByLoanRequest: state.unreadCountByLoanRequest
                };
              },
              false,
              'chat/clearChat'
            ),

          clearAllChats: () =>
            set(
              {
                messagesByRoom: {},
                unreadCountByRoom: {},
                totalUnreadCount: 0,
                messages: {},
                unreadCountByLoanRequest: {}
              },
              false,
              'chat/clearAllChats'
            )
        }),
        {
          name: 'chat-store',
          partialize: (state) => ({
            messages: Object.entries(state.messages).reduce(
              (acc, [loanRequestId, messages]) => {
                // Guardar solo los últimos 50 mensajes
                acc[loanRequestId] = messages.slice(-50);
                return acc;
              },
              {} as Record<string, ChatMessage[]>
            ),
            unreadCountByLoanRequest: state.unreadCountByLoanRequest,
            totalUnreadCount: state.totalUnreadCount,
            messagesByRoom: Object.entries(state.messagesByRoom).reduce(
              (acc, [roomId, messages]) => {
                // Guardar solo los últimos 50 mensajes por sala
                acc[roomId] = messages.slice(-50);
                return acc;
              },
              {} as Record<string, ChatMessage[]>
            ),
            unreadCountByRoom: state.unreadCountByRoom
          })
        }
      ),
      {
        name: 'Chat Store',
        enabled: process.env.NODE_ENV === 'development'
      }
    )
  );
}

export const useChatStore = () => {
  if (!store) {
    store = createStore();
  }
  return store();
};
