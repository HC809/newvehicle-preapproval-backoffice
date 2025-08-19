'use client';

import { useState, Suspense, useEffect, useMemo, useCallback } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useAxios from '@/hooks/use-axios';
import ErrorAlert from '@/components/custom/error-alert';
import ReferredLoanRequestListingPage from '@/features/loan-requests/components/referred-loan-request-listing';
import { useReferredLoanRequests } from '@/features/loan-requests/api/loan-request-service';
import { useSession } from 'next-auth/react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useSearchParams } from 'next/navigation';
import { UserRole } from 'types/User';
import { LoanRequest } from 'types/LoanRequests';

function ReferredLoanRequestContent() {
  const apiClient = useAxios();
  const { data: session } = useSession();
  const userRole = session?.role as UserRole;
  const searchParams = useSearchParams();

  // Estado local para el filtro de DNI (usado exclusivamente de forma local)
  const [dniFilter, setDniFilter] = useState('');

  // Obtener los valores de los otros filtros desde la URL
  const dealershipFilter = searchParams.get('dealership') || '';
  const managerFilter = searchParams.get('manager') || '';
  const statusFilter = searchParams.get('status') || '';

  const {
    isLoading,
    isFetching,
    data: allReferredLoanRequests,
    error,
    refetch
  } = useReferredLoanRequests(apiClient, true);

  // Procesar los múltiples valores de estado (si existen)
  const statusValues = useMemo(() => {
    if (!statusFilter) return [];
    return statusFilter.split('.');
  }, [statusFilter]);

  // Aplicar filtros localmente
  const filteredReferredLoanRequests = useMemo(() => {
    if (!allReferredLoanRequests) return [];

    const filtered = allReferredLoanRequests.filter((request: LoanRequest) => {
      // Filtro por DNI (caso insensitivo y eliminando espacios)
      if (dniFilter && dniFilter.trim() !== '') {
        const normalizedDni = request.dni.toLowerCase().trim();
        const normalizedClientName =
          request.clientName?.toLowerCase().trim() || '';
        const normalizedFilter = dniFilter.toLowerCase().trim();
        if (
          !normalizedDni.includes(normalizedFilter) &&
          !normalizedClientName.includes(normalizedFilter)
        ) {
          return false;
        }
      }

      // Filtro por concesionaria
      if (dealershipFilter && request.dealershipId !== dealershipFilter) {
        return false;
      }

      // Filtro por responsable
      if (managerFilter && request.managerName !== managerFilter) {
        return false;
      }

      // Filtro por estado (múltiples valores posibles)
      if (statusValues.length > 0 && !statusValues.includes(request.status)) {
        return false;
      }

      return true;
    });

    return filtered;
  }, [
    allReferredLoanRequests,
    dniFilter,
    dealershipFilter,
    managerFilter,
    statusValues
  ]);

  // Refetch solo cuando cambien los filtros que se envían al API
  useEffect(() => {
    refetch();
  }, [dealershipFilter, managerFilter, statusFilter, refetch]);

  // Función para resetear todos los filtros, incluyendo el de DNI
  const resetAllFilters = useCallback(() => {
    setDniFilter('');
    // Aquí podrías resetear los otros filtros si es necesario
  }, []);

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Solicitudes de Referidos'
            description='Administración de solicitudes de préstamo referidas por usuarios del sistema.'
          />
          <div className='flex items-center gap-4'>
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
          </div>
        </div>

        <Separator />

        {/* Filtros básicos */}
        <div className='flex items-center gap-4'>
          <div className='max-w-sm flex-1'>
            <input
              type='text'
              placeholder='Filtrar por DNI o nombre del cliente...'
              value={dniFilter}
              onChange={(e) => setDniFilter(e.target.value)}
              className='w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            />
          </div>
          <Button
            variant='outline'
            onClick={resetAllFilters}
            className='whitespace-nowrap'
          >
            Limpiar Filtros
          </Button>
        </div>

        {error ? (
          <div className='space-y-4'>
            <ErrorAlert error={error?.message || String(error)} />
          </div>
        ) : (
          <Suspense
            fallback={<DataTableSkeleton columnCount={7} rowCount={10} />}
          >
            <ReferredLoanRequestListingPage
              loanRequests={filteredReferredLoanRequests || []}
              totalItems={filteredReferredLoanRequests?.length || 0}
              isLoading={isLoading || !allReferredLoanRequests}
              userRole={userRole}
            />
          </Suspense>
        )}
      </div>
    </PageContainer>
  );
}

export default function ReferredLoanRequestsPage() {
  return <ReferredLoanRequestContent />;
}
