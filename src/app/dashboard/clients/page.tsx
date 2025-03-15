'use client';

import { ReloadIcon } from '@radix-ui/react-icons';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useAxios from '@/hooks/use-axios';
import ErrorAlert from '@/components/custom/error-alert';
import ClientListingPage from '@/features/clients/components/client-listing';
import { useClients } from '@/features/clients/api/client-service';
import KBar from '@/components/kbar';

function ClientContent() {
  const apiClient = useAxios();
  const {
    isLoading,
    isFetching,
    data: clients,
    error,
    refetch
  } = useClients(apiClient);

  const kbarActions = {};

  return (
    <KBar actions={kbarActions}>
      <PageContainer scrollable={false}>
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading
              title='Clientes'
              description='Administración de clientes.'
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
            </div>
          </div>

          <Separator />

          {error ? (
            <div className='space-y-4'>
              <ErrorAlert error={error?.message || String(error)} />
            </div>
          ) : (
            <>
              <ClientListingPage
                clients={clients || []}
                totalItems={clients?.length || 0}
                isLoading={isLoading || !clients}
              />
            </>
          )}
        </div>
      </PageContainer>
    </KBar>
  );
}

export default function ClientsPage() {
  return <ClientContent />;
}
