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
  viewMode: 'assigned' | 'all';
  isAdmin: boolean;
}

export default function LoanRequestListingPage({
  loanRequests,
  totalItems,
  isLoading,
  viewMode,
  isAdmin
}: LoanRequestListingPageProps) {
  if (isLoading) {
    return <DataTableSkeleton columnCount={10} rowCount={10} />;
  }

  if (!loanRequests || loanRequests.length === 0) {
    return <div>No hay solicitudes de préstamo disponibles.</div>;
  }

  return (
    <LoanRequestsTable
      columns={LoanRequestColumns(viewMode, isAdmin)}
      data={loanRequests}
      totalItems={totalItems}
    />
  );
}
