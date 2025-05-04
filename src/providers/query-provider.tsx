'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            //Determina cuánto tiempo permanecen los datos en estado "fresco" antes de considerarse "obsoletos" (stale)
            staleTime: 60 * 1000,
            //(Garbage Collection Time) controla cuánto tiempo permanecen los datos inactivos en la caché antes de ser eliminados
            gcTime: 5 * 60 * 1000,
            //Especifica cuántas veces TanStack Query reintentará una consulta fallida
            retry: 1
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}
