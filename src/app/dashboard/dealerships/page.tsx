'use client';

import { useState } from 'react';
import { PlusIcon, ReloadIcon } from '@radix-ui/react-icons';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useAxios from '@/hooks/use-axios';
import ErrorAlert from '@/components/custom/error-alert';
import DealershipListingPage from '@/features/dealerships/components/dealership-listing';
import DealershipForm from '@/features/dealerships/components/dealership-form';
import { useDealershipStore } from '@/stores/dealership-store';
import { AlertModal } from '@/components/modal/alert-modal';
import {
  useDealerships,
  useDeleteDealership
} from '@/features/dealerships/api/dealership-service';
import KBar from '@/components/kbar';
import { toast } from 'sonner';

function DealershipContent() {
  const apiClient = useAxios();
  const {
    isLoading,
    isFetching,
    data: dealerships,
    error,
    refetch
  } = useDealerships(apiClient);
  const deleteDealershipMutation = useDeleteDealership(apiClient);
  const {
    dealershipToEdit,
    dealershipToDelete,
    setDealershipToDelete,
    setDealershipToEdit
  } = useDealershipStore();

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDeleteDealership = async (): Promise<void> => {
    if (!dealershipToDelete) return;

    deleteDealershipMutation.mutate(dealershipToDelete.id, {
      onSuccess: () => {
        setDealershipToDelete(null);
        toast.success('Concesionaria eliminada correctamente.');
      }
    });
  };

  const handleCloseDeleteModal = () => {
    setDealershipToDelete(null);
    deleteDealershipMutation.reset(); // Reset the mutation state when closing the modal
  };

  const handleOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      // Also clear the edit state when closing the form
      setDealershipToEdit(null);
    }
  };

  const kbarActions = {
    openUserForm: () => setIsFormOpen(true)
  };

  return (
    <KBar actions={kbarActions}>
      <PageContainer scrollable={false}>
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading
              title='Concesionarias'
              description='Administración de concesionarias.'
            />
            <div className='flex gap-2'>
              <Button
                variant='default'
                size='icon'
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <ReloadIcon
                  className={cn('h-4 w-4', isFetching && 'animate-spin')}
                />
              </Button>
              <Button variant='default' onClick={() => setIsFormOpen(true)}>
                <PlusIcon className='mr-2 h-4 w-4' />
                Agregar Concesionaria
              </Button>
            </div>
          </div>

          <Separator />

          {error ? (
            <div className='space-y-4'>
              <ErrorAlert error={error?.message || String(error)} />
            </div>
          ) : (
            <>
              <DealershipListingPage
                dealerships={dealerships || []}
                totalItems={dealerships?.length || 0}
                isLoading={isLoading || !dealerships}
              />
              <DealershipForm
                open={isFormOpen || !!dealershipToEdit}
                onOpenChange={handleOpenChange}
              />
              <AlertModal
                isOpen={!!dealershipToDelete}
                loading={deleteDealershipMutation.isPending}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteDealership}
                error={
                  deleteDealershipMutation.error
                    ? String(deleteDealershipMutation.error)
                    : null
                }
                title='Eliminar Concesionaria'
                description={`¿Está seguro que desea eliminar la concesionaria "${dealershipToDelete?.name}"? Esta acción no se puede deshacer.`}
                confirmLabel='Eliminar'
                cancelLabel='Cancelar'
              />
            </>
          )}
        </div>
      </PageContainer>
    </KBar>
  );
}

export default function DealershipsPage() {
  return (
    // <ErrorBoundary fallback={<ErrorAlert />}>
    //   <Suspense fallback={<DataTableSkeleton />}>
    <DealershipContent />
    //   </Suspense>
    // </ErrorBoundary>
  );
}
