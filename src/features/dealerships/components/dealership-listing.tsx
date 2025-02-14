'use client';

import React from 'react';
import { DataTable as DealershipsTable } from '@/components/ui/table/data-table';
import { dealershipColumns } from '@/features/dealerships/components/dealership-columns';
import { Dealership } from 'types/Dealerships';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

interface DealershipListingPageProps {
  dealerships: Dealership[];
  totalItems: number;
  isValidating?: boolean;
  isLoading?: boolean;
}

export default function DealershipListingPage({
  dealerships,
  totalItems,
  isValidating,
  isLoading
}: DealershipListingPageProps) {
  if (isLoading) {
    return <DataTableSkeleton columnCount={5} rowCount={10} />;
  }

  if (!dealerships || dealerships.length === 0) {
    return <div>No hay concesionarias disponibles.</div>;
  }

  return (
    <DealershipsTable
      columns={dealershipColumns}
      data={dealerships}
      totalItems={totalItems}
    />
  );
}
