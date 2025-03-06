'use client';

import { useState } from 'react';
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

function LoanRequestContent() {
  const apiClient = useAxios();
  const { data: session } = useSession();
  const isAdmin = !!session?.isSystemAdmin;
  const [viewMode, setViewMode] = useState<'assigned' | 'all'>('assigned');

  const {
    isLoading,
    isFetching,
    data: loanRequests,
    error,
    refetch
  } = useLoanRequests(apiClient, { viewAll: viewMode === 'all' }, true);

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

          {error ? (
            <div className='space-y-4'>
              <ErrorAlert error={error?.message || String(error)} />
            </div>
          ) : (
            <>
              <LoanRequestListingPage
                loanRequests={loanRequests || []}
                totalItems={loanRequests?.length || 0}
                isLoading={isLoading || !loanRequests}
                viewMode={viewMode}
                isAdmin={isAdmin}
              />
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
