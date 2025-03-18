'use client';

import { useState, useEffect } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useAxios from '@/hooks/use-axios';
import ErrorAlert from '@/components/custom/error-alert';
import CompanyConfigurationListingPage from '@/features/company-configurations/components/company-configuration-listing';
import CompanyConfigurationForm from '@/features/company-configurations/components/company-configuration-form';
import { useCompanyConfigurations } from '@/features/company-configurations/api/company-configuration-service';
import { CompanyConfiguration } from 'types/CompanyConfigurations';
import { Edit } from 'lucide-react';

export default function CompanyConfigurationsPage() {
  const apiClient = useAxios();
  const {
    isLoading,
    isFetching,
    data: configurations,
    error,
    refetch
  } = useCompanyConfigurations(apiClient);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentConfiguration, setCurrentConfiguration] =
    useState<CompanyConfiguration | null>(null);

  // Update current configuration when data is loaded
  useEffect(() => {
    if (configurations && configurations.length > 0) {
      // Asumimos que la API devuelve los datos ordenados por fecha (más reciente primero)
      setCurrentConfiguration(configurations[0]);
    }
  }, [configurations]);

  const handleOpenChange = (open: boolean) => {
    setIsFormOpen(open);
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Configuración de la Empresa'
            description='Administración de Parámetros Financieros.'
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
              <Edit className='mr-2 h-4 w-4' />
              Actualizar
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
            <CompanyConfigurationListingPage
              configurations={configurations || []}
              totalItems={configurations?.length || 0}
              isLoading={isLoading || !configurations}
            />

            <CompanyConfigurationForm
              open={isFormOpen}
              onOpenChange={handleOpenChange}
              currentConfiguration={currentConfiguration}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}
