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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

function LoanRequestContent() {
  const apiClient = useAxios();
  const [viewAll, setViewAll] = useState(false);

  const {
    isLoading,
    isFetching,
    data: loanRequests,
    error,
    refetch
  } = useLoanRequests(apiClient, { viewAll }, true);

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
              <div className='flex items-center space-x-2'>
                <Switch
                  id='view-all'
                  checked={viewAll}
                  onCheckedChange={setViewAll}
                />
                <Label htmlFor='view-all'>Ver todos</Label>
              </div>
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
