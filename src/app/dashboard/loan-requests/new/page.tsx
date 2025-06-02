'use client';

import { useState } from 'react';
import { PlusIcon, ReloadIcon } from '@radix-ui/react-icons';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useAxios from '@/hooks/use-axios';
import ErrorAlert from '@/components/custom/error-alert';
import { useLoanRequests } from '@/features/loan-requests/api/loan-request-service';
import LoanRequestForm from '@/features/loan-requests/components/loan-request-form';
import KBar from '@/components/kbar';

function LoanRequestContent() {
  const apiClient = useAxios();
  const {
    isLoading,
    isFetching,
    data: loanRequests,
    error,
    refetch
  } = useLoanRequests(apiClient);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const kbarActions = {};

  return (
    <KBar actions={kbarActions}>
      <PageContainer scrollable={false}>
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading
              title='Solicitudes de Préstamo'
              description='Administración de solicitudes de préstamo.'
            />
            <div className='flex gap-2'>
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
              <Button variant='default' onClick={() => setIsFormOpen(true)}>
                <PlusIcon className='mr-2 h-4 w-4' />
                Nueva Solicitud
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
              {/* TODO: Add loan request listing component */}
              <div className='text-center text-muted-foreground'>
                Lista de solicitudes en desarrollo...
              </div>

              <LoanRequestForm open={isFormOpen} onOpenChange={setIsFormOpen} />
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
