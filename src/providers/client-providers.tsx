'use client';

import { QueryProvider } from './query-provider';
import { TokenProvider } from '@/features/auth/TokenContext';
import { NotificationProvider } from '@/features/notifications/NotificationContext';
import { ChatProvider } from '@/features/chat/ChatContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <TokenProvider>
      <QueryProvider>
        <NotificationProvider>
          <ChatProvider>{children}</ChatProvider>
        </NotificationProvider>
      </QueryProvider>
    </TokenProvider>
  );
}
