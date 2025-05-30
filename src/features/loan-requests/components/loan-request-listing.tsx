'use client';

import React from 'react';
import { DataTable as LoanRequestsTable } from '@/components/ui/table/data-table';
import { LoanRequestColumns } from './loan-request-columns';
import { LoanRequest } from 'types/LoanRequests';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useRouter } from 'next/navigation';
import { useLoanRequestStore } from '@/stores/loan-request-store';
import { Row } from '@tanstack/react-table';
import { UserRole } from 'types/User';

interface LoanRequestListingPageProps {
  loanRequests: LoanRequest[];
  totalItems: number;
  isLoading?: boolean;
  viewMode: 'assigned' | 'all';
  isAdmin: boolean;
  userRole?: UserRole;
}

export default function LoanRequestListingPage({
  loanRequests,
  totalItems,
  isLoading,
  viewMode,
  isAdmin,
  userRole
}: LoanRequestListingPageProps) {
  const router = useRouter();
  const { setSelectedLoanRequest } = useLoanRequestStore();

  // Ya no limpiamos automáticamente la solicitud seleccionada
  // Esto permite que al navegar de vuelta desde la página de detalle,
  // la solicitud seleccionada se mantenga en el store

  if (isLoading) {
    return <DataTableSkeleton columnCount={10} rowCount={10} />;
  }

  if (!loanRequests || loanRequests.length === 0) {
    return <div>No hay solicitudes de préstamo disponibles.</div>;
  }

  // Función para manejar el clic en la fila
  const handleRowClick = (row: Row<LoanRequest>) => {
    const loanRequest = row.original;
    // Guardamos la solicitud en el store para facilitar la navegación
    // pero los datos reales se obtendrán del API en la página de detalle
    setSelectedLoanRequest(loanRequest);
    router.push(`/dashboard/loan-requests/${loanRequest.id}`);
  };

  return (
    <>
      {/* {selectedLoanRequest && (
        <div className="mb-4 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
          <div className="text-sm">
            <span className="font-medium">Solicitud seleccionada: </span>
            <span className="text-blue-700 dark:text-blue-300">
              {formatLoanRequestId(selectedLoanRequest.id)} - {selectedLoanRequest.dni}
            </span>
          </div>
          <button
            onClick={clearSelectedLoanRequest}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            Limpiar selección
          </button>
        </div>
      )} */}
      <LoanRequestsTable
        columns={LoanRequestColumns(viewMode, isAdmin, userRole)}
        data={loanRequests}
        totalItems={totalItems}
        onRowClick={handleRowClick}
      />
    </>
  );
}
