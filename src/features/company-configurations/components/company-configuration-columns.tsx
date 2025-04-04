'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CompanyConfiguration } from 'types/CompanyConfigurations';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatHNL } from '@/utils/formatCurrency';

export const CompanyConfigurationColumns: ColumnDef<CompanyConfiguration>[] = [
  {
    id: 'status',
    header: () => <span className='font-bold'>Estado</span>,
    cell: ({ row }) => {
      // Get the index of the row to determine if it's the most recent
      const rowIndex = row.index;

      return rowIndex === 0 ? (
        <Badge variant='default' className=''>
          Actual
        </Badge>
      ) : (
        <Badge variant='outline'>Histórico</Badge>
      );
    }
  },
  {
    accessorKey: 'interestRate',
    header: () => <span className='font-bold'>Tasa de Interés</span>,
    cell: ({ row }) => {
      const interestRate = row.getValue('interestRate') as number;
      return (
        <div className='font-medium'>
          {interestRate != 0 ? `${interestRate.toFixed(2)}%` : '0%'}
        </div>
      );
    }
  },
  {
    accessorKey: 'minDownPaymentPercentage',
    header: () => <span className='font-bold'>Prima Mínima</span>,
    cell: ({ row }) => {
      const minDownPaymentPercentage = row.getValue(
        'minDownPaymentPercentage'
      ) as number;
      return (
        <div className='font-medium'>
          {minDownPaymentPercentage != 0
            ? `${minDownPaymentPercentage.toFixed(2)}%`
            : '0%'}
        </div>
      );
    }
  },
  {
    accessorKey: 'vehicleInsuranceRateUnder3_5T',
    header: () => <span className='font-bold'>Seguro ≤ 3.5T</span>,
    cell: ({ row }) => {
      const rate = row.getValue('vehicleInsuranceRateUnder3_5T') as number;
      return (
        <div className='font-medium'>
          {rate != 0 ? `${rate.toFixed(2)}%` : '0%'}
        </div>
      );
    }
  },
  {
    accessorKey: 'vehicleInsuranceRateOver3_5T',
    header: () => <span className='font-bold'>Seguro &gt; 3.5T</span>,
    cell: ({ row }) => {
      const rate = row.getValue('vehicleInsuranceRateOver3_5T') as number;
      return (
        <div className='font-medium'>
          {rate != 0 ? `${rate.toFixed(2)}%` : '0%'}
        </div>
      );
    }
  },
  {
    accessorKey: 'monthlyGpsFee',
    header: () => <span className='font-bold'>Tarifa Mensual GPS</span>,
    cell: ({ row }) => {
      const monthlyGpsFee = row.getValue('monthlyGpsFee') as number;
      return <div className='font-medium'>{formatHNL(monthlyGpsFee)}</div>;
    }
  },
  {
    accessorKey: 'closingCosts',
    header: () => <span className='font-bold'>Gastos de Cierre</span>,
    cell: ({ row }) => {
      const closingCosts = row.getValue('closingCosts') as number;
      return <div className='font-medium'>{formatHNL(closingCosts)}</div>;
    }
  },
  {
    accessorKey: 'dollarExchangeRate',
    header: () => <span className='font-bold'>Tasa de Cambio del Dólar</span>,
    cell: ({ row }) => {
      const dollarExchangeRate = row.getValue('dollarExchangeRate') as number;
      return (
        <div className='font-medium'>
          {dollarExchangeRate != 0 ? `${dollarExchangeRate.toFixed(2)}` : '0'}
        </div>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: () => <span className='font-bold'>Fecha de Creación</span>,
    cell: ({ row }) => {
      const createdAt = row.getValue('createdAt') as string;
      const date = new Date(createdAt);

      return (
        <div className='font-medium'>
          {format(date, 'PPpp', { locale: es })}
        </div>
      );
    }
  }
  // {
  //     accessorKey: 'id',
  //     header: () => <span className='font-bold'>ID</span>,
  //     cell: ({ row }) => {
  //         const id = row.getValue('id') as string;
  //         return (
  //             <div className="font-mono text-xs text-muted-foreground truncate max-w-[150px]" title={id}>
  //                 {id}
  //             </div>
  //         );
  //     }
  // }
];
