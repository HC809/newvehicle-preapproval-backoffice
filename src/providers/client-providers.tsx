'use client';

import { QueryProvider } from './query-provider';
import { TokenProvider } from '@/features/auth/TokenContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <TokenProvider>
      <QueryProvider>{children}</QueryProvider>
    </TokenProvider>
  );
}
