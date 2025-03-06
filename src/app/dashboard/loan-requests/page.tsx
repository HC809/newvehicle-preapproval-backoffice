'use client';

import { useState, Suspense, useEffect } from 'react';
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

  // Obtener los valores de los filtros desde la URL
  const dniFilter = searchParams.get('dni') || '';
  const dealershipFilter = searchParams.get('dealership') || '';
  const managerFilter = searchParams.get('manager') || '';

  // Logs para depuración
  //console.log('searchParams:', searchParams.toString());
  //console.log('Filtros aplicados:', { dniFilter, dealershipFilter, managerFilter });

  const {
    isLoading,
    isFetching,
    data: loanRequests,
    error,
    refetch
  } = useLoanRequests(
    apiClient,
    {
      viewAll: viewMode === 'all',
      dni: dniFilter,
      dealership: dealershipFilter,
      manager: managerFilter
    },
    true
  );

  // Logs para depuración
  //console.log('Datos recibidos:', loanRequests?.length || 0);

  // Refetch cuando cambien los filtros o el modo de vista
  useEffect(() => {
    //console.log('Filtros o modo de vista cambiaron, refetching...');
    refetch();
  }, [dniFilter, dealershipFilter, managerFilter, viewMode, refetch]);

  // Forzar refetch cuando se monte el componente
  useEffect(() => {
    //console.log('Componente montado, refetching...');
    refetch();
  }, [refetch]);

  // Actualizar dniFilter cuando cambie el valor en el campo de búsqueda
  //   useEffect(() => {
  //     const dniValue = searchParams.get('dni');
  //     if (dniValue !== dniFilter) {
  //       //console.log('Actualizando dniFilter a:', dniValue);
  //       refetch();
  //     }
  //   }, [searchParams]);

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

          <LoanRequestTableAction />

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
                  loanRequests={loanRequests || []}
                  totalItems={loanRequests?.length || 0}
                  isLoading={isLoading || !loanRequests}
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
