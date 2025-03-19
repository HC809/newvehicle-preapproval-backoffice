'use client';

import React from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { CompanyConfigurationColumns } from './company-configuration-columns';
import { CompanyConfiguration } from 'types/CompanyConfigurations';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, InfoIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatHNL } from '@/utils/formatCurrency';

interface CompanyConfigurationListingPageProps {
  configurations: CompanyConfiguration[];
  totalItems: number;
  isLoading?: boolean;
}

export default function CompanyConfigurationListingPage({
  configurations,
  totalItems,
  isLoading
}: CompanyConfigurationListingPageProps) {
  // Get the current configuration (most recent one)
  const currentConfiguration =
    configurations && configurations.length > 0 ? configurations[0] : null;

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-6'>
          <Card className='animate-pulse'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Tasa de Interés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-6 w-24 rounded bg-muted'></div>
            </CardContent>
          </Card>
          <Card className='animate-pulse'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Prima Mínima
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-6 w-24 rounded bg-muted'></div>
            </CardContent>
          </Card>
          <Card className='animate-pulse'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Gastos de Cierre
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-6 w-24 rounded bg-muted'></div>
            </CardContent>
          </Card>
          <Card className='animate-pulse'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Seguro Vehículo ≤ 3.5T
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-6 w-24 rounded bg-muted'></div>
            </CardContent>
          </Card>
          <Card className='animate-pulse'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Seguro Vehículo &gt; 3.5T
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-6 w-24 rounded bg-muted'></div>
            </CardContent>
          </Card>
          <Card className='animate-pulse'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Tarifa Mensual GPS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-6 w-24 rounded bg-muted'></div>
            </CardContent>
          </Card>
          {/* <Card className='animate-pulse'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>
                Tasa de Cambio del Dólar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-6 w-24 rounded bg-muted'></div>
            </CardContent>
          </Card> */}
        </div>
        <DataTableSkeleton columnCount={5} rowCount={10} />
      </div>
    );
  }

  if (!configurations || configurations.length === 0) {
    return <div>No hay configuraciones disponibles.</div>;
  }

  return (
    <>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-6'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Tasa de Interés
            </CardTitle>
          </CardHeader>
          <CardContent className='flex items-center'>
            <Percent className='mr-2 h-5 w-5 text-muted-foreground' />
            <span className='text-2xl font-bold'>
              {currentConfiguration?.interestRate != 0
                ? `${currentConfiguration?.interestRate?.toFixed(2)}%`
                : '0%'}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Prima Mínima</CardTitle>
          </CardHeader>
          <CardContent className='flex items-center'>
            <Percent className='mr-2 h-5 w-5 text-muted-foreground' />
            <span className='text-2xl font-bold'>
              {currentConfiguration?.minDownPaymentPercentage != 0
                ? `${currentConfiguration?.minDownPaymentPercentage.toFixed(2)}%`
                : '0%'}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Gastos de Cierre
            </CardTitle>
          </CardHeader>
          <CardContent className='flex items-center'>
            <span className='text-2xl font-bold'>
              {formatHNL(currentConfiguration?.closingCosts || 0)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Seguro Vehículo ≤ 3.5T
            </CardTitle>
          </CardHeader>
          <CardContent className='flex items-center'>
            <Percent className='mr-2 h-5 w-5 text-muted-foreground' />
            <span className='text-2xl font-bold'>
              {currentConfiguration?.vehicleInsuranceRateUnder3_5T != 0
                ? `${currentConfiguration?.vehicleInsuranceRateUnder3_5T?.toFixed(2)}%`
                : '0%'}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Seguro Vehículo &gt; 3.5T
            </CardTitle>
          </CardHeader>
          <CardContent className='flex items-center'>
            <Percent className='mr-2 h-5 w-5 text-muted-foreground' />
            <span className='text-2xl font-bold'>
              {currentConfiguration?.vehicleInsuranceRateOver3_5T != 0
                ? `${currentConfiguration?.vehicleInsuranceRateOver3_5T?.toFixed(2)}%`
                : '0%'}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Tarifa Mensual GPS
            </CardTitle>
          </CardHeader>
          <CardContent className='flex items-center'>
            <span className='text-2xl font-bold'>
              {formatHNL(currentConfiguration?.monthlyGpsFee || 0)}
            </span>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              Tasa de Cambio del Dólar
            </CardTitle>
          </CardHeader>
          <CardContent className='flex items-center'>
            <DollarSign className='mr-2 h-5 w-5 text-muted-foreground' />
            <span className='text-2xl font-bold'>
              {currentConfiguration?.dollarExchangeRate != 0 ? `${currentConfiguration?.dollarExchangeRate?.toFixed(2)}` : '0'}
            </span>
          </CardContent>
        </Card> */}
      </div>

      <Alert className='border-blue-200 bg-blue-50 text-foreground dark:border-primary/20 dark:bg-primary/10 dark:text-foreground'>
        <InfoIcon className='h-4 w-4 text-blue-500' />
        <AlertDescription>
          La tabla muestra el historial de todas las configuraciones. La
          configuración marcada como &ldquo;Actual&rdquo; es la que se utiliza
          para los nuevos préstamos.
        </AlertDescription>
      </Alert>

      {/* Tabla de configuraciones */}
      <DataTable
        columns={CompanyConfigurationColumns}
        data={configurations}
        totalItems={totalItems}
      />
    </>
  );
}
