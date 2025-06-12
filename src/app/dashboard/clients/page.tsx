'use client';

import { ReloadIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
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
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';

function ClientContent() {
  const apiClient = useAxios();
  const [searchFilter, setSearchFilter] = useState('');

  const {
    isLoading,
    isFetching,
    data: clients,
    error,
    refetch
  } = useClients(apiClient);

  // Filter clients based on search input
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    if (!searchFilter.trim()) return clients;

    const normalizedSearch = searchFilter.toLowerCase().trim();
    return clients.filter((client) => {
      const normalizedName = client.name.toLowerCase();
      const normalizedDni = client.dni.toLowerCase();
      return (
        normalizedName.includes(normalizedSearch) ||
        normalizedDni.includes(normalizedSearch)
      );
    });
  }, [clients, searchFilter]);

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

          <div className='relative w-[300px]'>
            <MagnifyingGlassIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Buscar por DNI o nombre...'
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className='pl-9'
            />
          </div>

          {error ? (
            <div className='space-y-4'>
              <ErrorAlert error={error?.message || String(error)} />
            </div>
          ) : (
            <>
              <ClientListingPage
                clients={filteredClients}
                totalItems={filteredClients.length}
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
