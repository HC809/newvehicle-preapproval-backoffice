'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import useAxios from '@/hooks/use-axios';
import useSWR from 'swr';
import { Dealership } from 'types/Dealerships';
import ErrorAlert from '@/components/custom/error-alert';
import { ReloadIcon } from '@radix-ui/react-icons';
import DealershipListingPage from '@/features/dealerships/components/dealership-listing';

export default function DealershipsPage() {
  const apiClient = useAxios();

  const fetcher = async (url: string) => {
    if (!apiClient) return;
    const response = await apiClient.get(url);
    return response.data;
  };

  const {
    data: dealerships,
    error,
    isLoading,
    isValidating,
    mutate
  } = useSWR<Dealership[]>(apiClient ? '/dealerships' : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 0
  });

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Concesionarias'
            description='Administración de concesionarias.'
          />
          <Link
            href='/dashboard/dealerships/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className='mr-2 h-4 w-4' /> Agregar
          </Link>
        </div>

        <Separator />

        {error ? (
          <div className='space-y-4'>
            <ErrorAlert error={error} />
            <div className='flex justify-center'>
              <Button onClick={() => mutate()} disabled={isValidating}>
                <ReloadIcon
                  className={cn('mr-2 h-4 w-4', isValidating && 'animate-spin')}
                />
                {isValidating ? 'Cargando...' : 'Reintentar'}
              </Button>
            </div>
          </div>
        ) : (
          <DealershipListingPage
            dealerships={dealerships || []}
            totalItems={dealerships?.length || 0}
            isValidating={isValidating}
            isLoading={isLoading || !dealerships}
          />
        )}
      </div>
    </PageContainer>
  );
}
