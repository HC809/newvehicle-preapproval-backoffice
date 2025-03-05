'use client';

import React from 'react';
import { DataTable as VehicleTypesTable } from '@/components/ui/table/data-table';
import { VehicleTypeColumns } from './vehicle-type-columns';
import { VehicleType } from 'types/VehicleTypes';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useVehicleTypeStore } from '@/stores/vehicle-type-store';

interface VehicleTypeListingPageProps {
  vehicleTypes: VehicleType[];
  totalItems: number;
  isLoading?: boolean;
}

export default function VehicleTypeListingPage({
  vehicleTypes,
  totalItems,
  isLoading
}: VehicleTypeListingPageProps) {
  const { setVehicleTypeToEdit } = useVehicleTypeStore();

  if (isLoading) {
    return <DataTableSkeleton columnCount={3} rowCount={10} />;
  }

  if (!vehicleTypes || vehicleTypes.length === 0) {
    return <div>No hay tipos de vehículos disponibles.</div>;
  }

  return (
    <VehicleTypesTable
      columns={VehicleTypeColumns(setVehicleTypeToEdit)}
      data={vehicleTypes}
      totalItems={totalItems}
    />
  );
}
