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
import LoanRequestListingPage from '@/features/loan-requests/components/loan-request-listing';
import { useLoanRequests } from '@/features/loan-requests/api/loan-request-service';
import KBar from '@/components/kbar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from 'next-auth/react';
import LoanRequestTableAction from '@/features/loan-requests/components/loan-request-table-action';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useSearchParams } from 'next/navigation';

function LoanRequestContent() {
  const apiClient = useAxios();
  const { data: session } = useSession();
  const isAdmin = !!session?.isSystemAdmin;
  const [viewMode, setViewMode] = useState<'assigned' | 'all'>('assigned');
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
    data: allLoanRequests,
    error,
    refetch
  } = useLoanRequests(
    apiClient,
    {
      viewAll: viewMode === 'all',
      // No enviamos el filtro DNI a la API
      dealership: dealershipFilter || undefined,
      manager: managerFilter || undefined,
      status: statusFilter || undefined
    },
    true
  );

  // Procesar los múltiples valores de estado (si existen)
  const statusValues = useMemo(() => {
    if (!statusFilter) return [];
    return statusFilter.split('.');
  }, [statusFilter]);

  // Aplicar filtros localmente
  const filteredLoanRequests = useMemo(() => {
    if (!allLoanRequests) return [];

    const filtered = allLoanRequests.filter((request) => {
      // No necesitamos filtrar por viewMode aquí ya que eso se maneja en la API

      // Filtro por DNI (caso insensitivo y eliminando espacios)
      if (dniFilter && dniFilter.trim() !== '') {
        const normalizedDni = request.dni.toLowerCase().trim();
        const normalizedFilter = dniFilter.toLowerCase().trim();
        if (!normalizedDni.includes(normalizedFilter)) {
          return false;
        }
      }

      // Filtro por concesionaria (solo si no se envía al API)
      if (dealershipFilter && request.dealershipId !== dealershipFilter) {
        return false;
      }

      // Filtro por responsable (solo si no se envía al API)
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
    allLoanRequests,
    dniFilter,
    dealershipFilter,
    managerFilter,
    statusValues
  ]);

  // Refetch solo cuando cambie el modo de vista o los filtros que se envían al API
  // No hacemos refetch cuando solo cambia el filtro de DNI (se maneja localmente)
  useEffect(() => {
    refetch();
  }, [viewMode, dealershipFilter, managerFilter, statusFilter, refetch]);

  // Función para resetear todos los filtros, incluyendo el de DNI
  const resetAllFilters = useCallback(() => {
    setDniFilter('');
    // Aquí podrías resetear los otros filtros si es necesario
  }, []);

  const kbarActions = {};

  return (
    <KBar actions={kbarActions}>
      <PageContainer scrollable={false}>
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading
              title='Solicitudes de Préstamo'
              description='Administración de solicitudes de préstamo para vehículos.'
            />
            <div className='flex items-center gap-4'>
              {!isAdmin && (
                <Tabs
                  value={viewMode}
                  onValueChange={(value) =>
                    setViewMode(value as 'assigned' | 'all')
                  }
                  className='mr-2'
                >
                  <TabsList>
                    <TabsTrigger value='assigned'>Asignadas</TabsTrigger>
                    <TabsTrigger value='all'>Todas</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
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

          <LoanRequestTableAction
            dniFilter={dniFilter}
            setDniFilter={setDniFilter}
            resetAllFilters={resetAllFilters}
          />

          {error ? (
            <div className='space-y-4'>
              <ErrorAlert error={error?.message || String(error)} />
            </div>
          ) : (
            <>
              <Suspense
                fallback={<DataTableSkeleton columnCount={10} rowCount={10} />}
              >
                <LoanRequestListingPage
                  loanRequests={filteredLoanRequests || []}
                  totalItems={filteredLoanRequests?.length || 0}
                  isLoading={isLoading || !allLoanRequests}
                  viewMode={viewMode}
                  isAdmin={isAdmin}
                />
              </Suspense>
            </>
          )}
        </div>
      </PageContainer>
    </KBar>
  );
}

export default function LoanRequestsPage() {
  return <LoanRequestContent />;
}
