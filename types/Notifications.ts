export enum LoanNotificationType {
  StatusChanged = 'StatusChanged',
  Message = 'Message',
  System = 'System'
}

export interface LoanNotification {
  id: string;
  title: string;
  message: string;
  type: LoanNotificationType;
  userToNotifyId?: string;
  expiredAt?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface LoanNotificationResponse {
  id: string;
  title: string;
  message: string;
  type: LoanNotificationType;
  userToNotifyId: string;
  expiredAt?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}
