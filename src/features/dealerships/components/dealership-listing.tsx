'use client';

import React from 'react';
import { DataTable as DealershipsTable } from '@/components/ui/table/data-table';
import { DealershipColumns } from './dealership-columns';
import { Dealership } from 'types/Dealerships';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useDealershipStore } from '@/stores/dealership-store';

interface DealershipListingPageProps {
  dealerships: Dealership[];
  totalItems: number;
  isLoading?: boolean;
}

export default function DealershipListingPage({
  dealerships,
  totalItems,
  isLoading
}: DealershipListingPageProps) {
  const { setDealershipToEdit } = useDealershipStore();

  if (isLoading) {
    return <DataTableSkeleton columnCount={5} rowCount={10} />;
  }

  if (!dealerships || dealerships.length === 0) {
    return <div>No hay concesionarias disponibles.</div>;
  }

  return (
    <DealershipsTable
      columns={DealershipColumns(setDealershipToEdit)}
      data={dealerships}
      totalItems={totalItems}
    />
  );
}
