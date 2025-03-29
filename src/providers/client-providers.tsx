'use client';

import { QueryProvider } from './query-provider';
import { TokenProvider } from '@/features/auth/TokenContext';
import { NotificationProvider } from '@/features/notifications/NotificationContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <TokenProvider>
      <QueryProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </QueryProvider>
    </TokenProvider>
  );
}
