'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  PlusIcon,
  ReloadIcon,
  MagnifyingGlassIcon
} from '@radix-ui/react-icons';
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
  useDeleteDealership,
  useRestoreDealership
} from '@/features/dealerships/api/dealership-service';
import { getDealershipModalProps } from '@/features/dealerships/helpers/modal-helpers';
import KBar from '@/components/kbar';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { useUsers } from '@/features/users/api/user-service';
import { UserRole } from 'types/User';
import { Options } from 'nuqs';

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
  const restoreDealershipMutation = useRestoreDealership(apiClient);

  const {
    dealershipToEdit,
    dealershipToDelete,
    dealershipToRestore,
    setDealershipToDelete,
    setDealershipToEdit,
    setDealershipToRestore
  } = useDealershipStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [managerFilter, setManagerFilter] = useState('');

  // Get users for manager filter
  const { data: users = [] } = useUsers(apiClient);
  const activeManagers = users.filter(
    (user) => user.role === UserRole.BusinessDevelopment_User && user.isActive
  );

  // Manager options for filter
  const MANAGER_OPTIONS = useMemo(
    () => [
      { value: 'unassigned', label: 'Sin asignar' },
      ...activeManagers.map((manager) => ({
        value: manager.name,
        label: manager.name
      }))
    ],
    [activeManagers]
  );

  // Filter dealerships based on search and manager filter
  const filteredDealerships = useMemo(() => {
    if (!dealerships) return [];

    return dealerships.filter((dealership) => {
      const matchesSearch = searchQuery
        ? dealership.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesManager = managerFilter
        ? managerFilter === 'unassigned'
          ? !dealership.managerId
          : dealership.managerName === managerFilter
        : true;

      return matchesSearch && matchesManager;
    });
  }, [dealerships, searchQuery, managerFilter]);

  const setManagerFilterValue = useCallback(
    (
      value: string | ((old: string) => string | null) | null,
      options?: Options
    ) => {
      let newValue: string | null = null;
      if (typeof value === 'function') {
        newValue = value(managerFilter);
      } else {
        newValue = value;
      }
      setManagerFilter(newValue || '');
      return Promise.resolve(new URLSearchParams());
    },
    [managerFilter]
  );

  const modalAction = dealershipToDelete
    ? 'delete'
    : dealershipToRestore
      ? 'restore'
      : null;

  const handleConfirmAction = async (): Promise<void> => {
    if (modalAction === 'delete' && dealershipToDelete) {
      deleteDealershipMutation.mutate(dealershipToDelete.id, {
        onSuccess: () => {
          setDealershipToDelete(null);
          toast.success('Concesionaria eliminada correctamente.');
          refetch();
        }
      });
    } else if (modalAction === 'restore' && dealershipToRestore) {
      restoreDealershipMutation.mutate(dealershipToRestore.id, {
        onSuccess: () => {
          setDealershipToRestore(null);
          toast.success('Concesionaria restaurada correctamente.');
          refetch();
        }
      });
    }
  };

  const handleCloseModal = () => {
    if (modalAction === 'delete') {
      setDealershipToDelete(null);
      deleteDealershipMutation.reset();
    } else if (modalAction === 'restore') {
      setDealershipToRestore(null);
      restoreDealershipMutation.reset();
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setDealershipToEdit(null);
    }
  };

  const selectedDealership = dealershipToDelete || dealershipToRestore;
  const isModalOpen = Boolean(modalAction);
  const isModalLoading =
    modalAction === 'delete'
      ? deleteDealershipMutation.isPending
      : restoreDealershipMutation.isPending;
  const modalError =
    modalAction === 'delete'
      ? deleteDealershipMutation.error
        ? String(deleteDealershipMutation.error)
        : null
      : restoreDealershipMutation.error
        ? String(restoreDealershipMutation.error)
        : null;

  const modalProps = getDealershipModalProps(modalAction, selectedDealership);

  const kbarActions = {
    openUserForm: () => setIsFormOpen(true)
  };

  const resetFilters = () => {
    setSearchQuery('');
    setManagerFilter('');
  };

  const isAnyFilterActive = Boolean(searchQuery || managerFilter);

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
              <div className='flex flex-wrap items-center gap-4'>
                <div className='relative w-[300px]'>
                  <MagnifyingGlassIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Buscar por nombre...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-9'
                  />
                </div>

                <DataTableFilterBox
                  filterKey='managers'
                  title='Gestores'
                  options={MANAGER_OPTIONS}
                  setFilterValue={setManagerFilterValue}
                  filterValue={managerFilter}
                  translatedSelected='Seleccionado'
                  translatedClear='Limpiar filtros'
                />

                {isAnyFilterActive && (
                  <DataTableResetFilter
                    isFilterActive={isAnyFilterActive}
                    onReset={resetFilters}
                    translatedReset='Restablecer filtros'
                  />
                )}
              </div>

              <DealershipListingPage
                dealerships={filteredDealerships}
                totalItems={filteredDealerships.length}
                isLoading={isLoading || !dealerships}
              />

              <DealershipForm
                open={isFormOpen || !!dealershipToEdit}
                onOpenChange={handleOpenChange}
              />

              {modalAction && (
                <AlertModal
                  isOpen={isModalOpen}
                  loading={isModalLoading}
                  onClose={handleCloseModal}
                  onConfirm={handleConfirmAction}
                  error={modalError}
                  title={modalProps.title}
                  description={modalProps.description}
                  confirmLabel={modalProps.confirmLabel}
                  cancelLabel='Cancelar'
                  intent={modalProps.intent}
                />
              )}
            </>
          )}
        </div>
      </PageContainer>
    </KBar>
  );
}

export default function DealershipsPage() {
  return <DealershipContent />;
}
