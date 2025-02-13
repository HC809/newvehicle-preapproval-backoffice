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

export default function NamePage() {
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
    mutate
  } = useSWR<Dealership[]>(apiClient ? '/dealerships' : null, fetcher);

  if (error)
    return (
      <>
        <ErrorAlert error={error} />
        <Button className='mt-2' onClick={() => mutate()}>
          <ReloadIcon className='mr-2 h-4 w-4' /> Reintentar
        </Button>
      </>
    );

  if (!isLoading && dealerships?.length === 0)
    return <div>No hay concesionarias disponibles.</div>;

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Concesionarias'
            description='Administración de concesionarias.'
          />
          <Link
            href='/dashboard/product/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <Plus className='mr-2 h-4 w-4' /> Add New
          </Link>
        </div>
        <Separator />
        {isLoading ? (
          <DataTableSkeleton columnCount={5} rowCount={10} />
        ) : (
          <div>
            {dealerships?.map((dealership) => (
              <div key={dealership.id}>{dealership.name}</div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
