'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useAxios from '@/hooks/use-axios';
import useSWR from 'swr';
import {
  Dealership,
  DealershipForm as IDealershipForm
} from 'types/Dealerships';
import ErrorAlert from '@/components/custom/error-alert';
import { ReloadIcon } from '@radix-ui/react-icons';
import DealershipListingPage from '@/features/dealerships/components/dealership-listing';
import DealershipForm from '@/features/dealerships/components/dealership-form';
import { useDealershipStore } from '@/stores/dealership-store';

export default function DealershipsPage() {
  const apiClient = useAxios();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { dealershipToEdit, setDealershipToEdit } = useDealershipStore();

  const fetcher = async (url: string) => {
    if (!apiClient) return;
    const response = await apiClient.get(url);
    return response.data;
  };

  const handleCreateDealership = async (
    values: IDealershipForm
  ): Promise<void> => {
    await apiClient?.post('/dealerships/create', values);
    setIsFormOpen(false);
    mutate();
  };

  const handleEditDealership = async (
    values: IDealershipForm
  ): Promise<void> => {
    if (dealershipToEdit) {
      await apiClient?.put(`/dealerships/update/${dealershipToEdit.id}`, {
        id: dealershipToEdit.id,
        ...values
      });
      mutate();
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      if (dealershipToEdit) setDealershipToEdit(null);
    }
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
          <Button variant='default' onClick={() => setIsFormOpen(true)}>
            Agregar Concesionaria
          </Button>
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
          <>
            <DealershipListingPage
              dealerships={dealerships || []}
              totalItems={dealerships?.length || 0}
              isLoading={isLoading || !dealerships}
            />
            <DealershipForm
              onSubmit={
                dealershipToEdit ? handleEditDealership : handleCreateDealership
              }
              open={isFormOpen || !!dealershipToEdit}
              onOpenChange={handleOpenChange}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}
