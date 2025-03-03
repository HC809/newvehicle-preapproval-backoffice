'use client';

import React from 'react';
import { DataTable as DealershipsTable } from '@/components/ui/table/data-table';
import { DealershipColumns } from './dealership-columns';
import { Dealership } from 'types/Dealerships';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useDealershipStore } from '@/stores/dealership-store';
// import { useVirtualizer } from '@tanstack/react-virtual';

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
  const { setDealershipToEdit, setDealershipToDelete, setDealershipToRestore } =
    useDealershipStore();
  // const parentRef = useRef(null);

  // const rowVirtualizer = useVirtualizer({
  //   count: dealerships.length,
  //   getScrollElement: () => parentRef.current,
  //   estimateSize: () => 45,
  // });

  if (isLoading) {
    return <DataTableSkeleton columnCount={5} rowCount={10} />;
  }

  if (!dealerships || dealerships.length === 0) {
    return <div>No hay concesionarias disponibles.</div>;
  }

  return (
    <DealershipsTable
      columns={DealershipColumns(
        setDealershipToEdit,
        setDealershipToDelete,
        setDealershipToRestore
      )}
      data={dealerships}
      totalItems={totalItems}
    />
  );
}
