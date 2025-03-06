'use client';

import React from 'react';
import { DataTable as LoanRequestsTable } from '@/components/ui/table/data-table';
import { LoanRequestColumns } from './loan-request-columns';
import { LoanRequest } from 'types/LoanRequests';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

interface LoanRequestListingPageProps {
  loanRequests: LoanRequest[];
  totalItems: number;
  isLoading?: boolean;
}

export default function LoanRequestListingPage({
  loanRequests,
  totalItems,
  isLoading
}: LoanRequestListingPageProps) {
  if (isLoading) {
    return <DataTableSkeleton columnCount={9} rowCount={10} />;
  }

  if (!loanRequests || loanRequests.length === 0) {
    return <div>No hay solicitudes de préstamo disponibles.</div>;
  }

  return (
    <LoanRequestsTable
      columns={LoanRequestColumns()}
      data={loanRequests}
      totalItems={totalItems}
    />
  );
}
