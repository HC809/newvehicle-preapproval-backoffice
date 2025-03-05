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
import VehicleTypeListingPage from '@/features/vehicle-types/components/vehicle-type-listing';
import VehicleTypeForm from '@/features/vehicle-types/components/vehicle-type-form';
import { useVehicleTypeStore } from '@/stores/vehicle-type-store';
import { useVehicleTypes } from '@/features/vehicle-types/api/vehicle-type-service';
import KBar from '@/components/kbar';

function VehicleTypeContent() {
  const apiClient = useAxios();
  const {
    isLoading,
    isFetching,
    data: vehicleTypes,
    error,
    refetch
  } = useVehicleTypes(apiClient);

  const { vehicleTypeToEdit, setVehicleTypeToEdit } = useVehicleTypeStore();

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setVehicleTypeToEdit(null);
    }
  };

  const kbarActions = {
    openVehicleTypeForm: () => setIsFormOpen(true)
  };

  return (
    <KBar actions={kbarActions}>
      <PageContainer scrollable={false}>
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading
              title='Tipos de Vehículos'
              description='Administración de tipos de vehículos.'
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
                Agregar Tipo de Vehículo
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
              <VehicleTypeListingPage
                vehicleTypes={vehicleTypes || []}
                totalItems={vehicleTypes?.length || 0}
                isLoading={isLoading || !vehicleTypes}
              />

              <VehicleTypeForm
                open={isFormOpen || !!vehicleTypeToEdit}
                onOpenChange={handleOpenChange}
              />
            </>
          )}
        </div>
      </PageContainer>
    </KBar>
  );
}

export default function VehicleTypesPage() {
  return <VehicleTypeContent />;
}
