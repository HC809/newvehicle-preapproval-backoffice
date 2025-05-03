import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ChatMessage } from '@/features/chat/SignalRChatService';

interface ChatStore {
  // Mensajes por sala de chat
  messagesByRoom: Record<string, ChatMessage[]>;

  // Contadores de mensajes no leídos por sala
  unreadCountByRoom: Record<string, number>;

  // Contadores totales
  totalUnreadCount: number;

  // Acciones
  addMessage: (message: ChatMessage) => void;
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
          messagesByRoom: {},
          unreadCountByRoom: {},
          totalUnreadCount: 0,

          addMessage: (message) =>
            set(
              (state) => {
                const roomId = message.chatRoomId;
                const currentMessages = state.messagesByRoom[roomId] || [];

                // Verificar si el mensaje ya existe
                if (currentMessages.some((m) => m.id === message.id)) {
                  return state;
                }

                // Añadir el mensaje a la sala correspondiente
                const updatedMessages = [...currentMessages, message];

                // Actualizar contadores de no leídos
                const currentUnreadCount = state.unreadCountByRoom[roomId] || 0;
                const newUnreadCount = message.isRead
                  ? currentUnreadCount
                  : currentUnreadCount + 1;

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
                  totalUnreadCount: totalUnread
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
                    new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
                );

                // Contar mensajes no leídos en los nuevos mensajes
                let newUnreadCount = 0;
                newMessages.forEach((msg) => {
                  if (!msg.isRead) {
                    newUnreadCount++;
                  }
                });

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
                  totalUnreadCount: totalUnread
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

                // Actualizar mensajes como leídos
                const currentMessages = state.messagesByRoom[roomId] || [];
                const updatedMessages = currentMessages.map((msg) => ({
                  ...msg,
                  isRead: true
                }));

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
                  messagesByRoom: {
                    ...state.messagesByRoom,
                    [roomId]: updatedMessages
                  },
                  unreadCountByRoom: updatedUnreadCountByRoom,
                  totalUnreadCount: newTotalUnread
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
                  totalUnreadCount: newTotalUnread
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
                totalUnreadCount: 0
              },
              false,
              'chat/clearAllChats'
            )
        }),
        {
          name: 'chat-storage',
          partialize: (state) => ({
            // Solo guardar los mensajes más recientes por sala para evitar almacenar demasiados datos
            messagesByRoom: Object.entries(state.messagesByRoom).reduce(
              (acc, [roomId, messages]) => {
                // Guardar solo los últimos 50 mensajes por sala
                acc[roomId] = messages.slice(-50);
                return acc;
              },
              {} as Record<string, ChatMessage[]>
            ),
            unreadCountByRoom: state.unreadCountByRoom,
            totalUnreadCount: state.totalUnreadCount
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
