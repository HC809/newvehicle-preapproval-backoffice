import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { LoanNotification } from 'types/Notifications';

// Número máximo de notificaciones para mostrar en el popover
const MAX_RECENT_NOTIFICATIONS = 5;

interface NotificationStore {
  // Notificaciones no leídas (para el badge)
  notifications: LoanNotification[];
  count: number;

  // Notificaciones recientes (para mostrar en el popover)
  recentNotifications: LoanNotification[];

  // Acciones
  addNotification: (notification: LoanNotification) => void;
  addNotifications: (notifications: LoanNotification[]) => void;
  clearNotifications: () => void;
  clearBadgeOnly: () => void;
}

let store: ReturnType<typeof createStore>;

function createStore() {
  return create<NotificationStore>()(
    devtools(
      persist(
        (set, get) => ({
          notifications: [],
          count: 0,
          recentNotifications: [],

          addNotification: (notification) =>
            set(
              (state) => {
                // Verificar si la notificación ya existe por ID en las no leídas
                if (state.notifications.some((n) => n.id === notification.id)) {
                  return state;
                }

                // Actualizar notificaciones no leídas
                const updatedNotifications = [
                  ...state.notifications,
                  notification
                ];

                // Actualizar notificaciones recientes
                // Añadir la nueva notificación al principio y limitar a MAX_RECENT_NOTIFICATIONS
                const updatedRecentNotifications = [
                  notification,
                  ...state.recentNotifications
                ].slice(0, MAX_RECENT_NOTIFICATIONS);

                return {
                  notifications: updatedNotifications,
                  count: updatedNotifications.length,
                  recentNotifications: updatedRecentNotifications
                };
              },
              false,
              'notification/addNotification'
            ),

          addNotifications: (notifications) =>
            set(
              (state) => {
                // Filtrar notificaciones que ya existen en el estado
                const newNotifications = notifications.filter(
                  (newNotif) =>
                    !state.notifications.some(
                      (existing) => existing.id === newNotif.id
                    )
                );

                if (newNotifications.length === 0) {
                  return state;
                }

                // Actualizar notificaciones no leídas
                const updatedNotifications = [
                  ...state.notifications,
                  ...newNotifications
                ];

                // Actualizar notificaciones recientes
                // Añadir las nuevas notificaciones al principio y limitar a MAX_RECENT_NOTIFICATIONS
                const updatedRecentNotifications = [
                  ...newNotifications,
                  ...state.recentNotifications
                ].slice(0, MAX_RECENT_NOTIFICATIONS);

                return {
                  notifications: updatedNotifications,
                  count: updatedNotifications.length,
                  recentNotifications: updatedRecentNotifications
                };
              },
              false,
              'notification/addNotifications'
            ),

          clearNotifications: () =>
            set(
              {
                notifications: [],
                count: 0
                // No limpiamos recentNotifications para mantenerlas en el popover
              },
              false,
              'notification/clearNotifications'
            ),

          clearBadgeOnly: () =>
            set(
              {
                notifications: [],
                count: 0
                // No limpiamos recentNotifications
              },
              false,
              'notification/clearBadgeOnly'
            )
        }),
        {
          name: 'notification-storage',
          partialize: (state) => ({
            notifications: state.notifications,
            count: state.count,
            recentNotifications: state.recentNotifications
          })
        }
      ),
      {
        name: 'Notification Store',
        enabled: process.env.NODE_ENV === 'development'
      }
    )
  );
}

export const useNotificationStore = () => {
  if (!store) {
    store = createStore();
  }
  return store();
};
