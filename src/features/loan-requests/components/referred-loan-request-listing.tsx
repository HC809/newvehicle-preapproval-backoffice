'use client';

import React from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { ReferredLoanRequestColumns } from './referred-loan-request-columns';
import { LoanRequest } from 'types/LoanRequests';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useRouter } from 'next/navigation';
import { useLoanRequestStore } from '@/stores/loan-request-store';
import { Row } from '@tanstack/react-table';
import { UserRole } from 'types/User';

interface ReferredLoanRequestListingPageProps {
  loanRequests: LoanRequest[];
  totalItems: number;
  isLoading?: boolean;
  userRole?: UserRole;
}

export default function ReferredLoanRequestListingPage({
  loanRequests,
  totalItems,
  isLoading,
  userRole
}: ReferredLoanRequestListingPageProps) {
  const router = useRouter();
  const { setSelectedLoanRequest } = useLoanRequestStore();

  if (isLoading) {
    return <DataTableSkeleton columnCount={7} rowCount={10} />;
  }

  if (!loanRequests || loanRequests.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-8 text-center'>
        <div className='mb-2 text-gray-500 dark:text-gray-400'>
          No hay solicitudes de referidos disponibles.
        </div>
        <div className='text-sm text-gray-400 dark:text-gray-500'>
          Las solicitudes de referidos aparecerán aquí cuando estén disponibles.
        </div>
      </div>
    );
  }

  // Función para manejar el clic en la fila
  const handleRowClick = (row: Row<LoanRequest>) => {
    const loanRequest = row.original;
    // Guardamos la solicitud en el store para facilitar la navegación
    setSelectedLoanRequest(loanRequest);
    router.push(`/dashboard/loan-requests/${loanRequest.id}`);
  };

  return (
    <DataTable
      columns={ReferredLoanRequestColumns(userRole)}
      data={loanRequests}
      totalItems={totalItems}
      onRowClick={handleRowClick}
    />
  );
}
