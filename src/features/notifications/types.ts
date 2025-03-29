export type NotificationType = 'info' | 'success' | 'error' | 'warning';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  userToNotifyId?: string;
  expiredAt?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: string;
  userToNotifyId: string;
  expiredAt?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}
