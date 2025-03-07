'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CompanyConfiguration } from 'types/CompanyConfigurations';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const CompanyConfigurationColumns: ColumnDef<CompanyConfiguration>[] = [
  {
    id: 'status',
    header: () => <span className='font-bold'>Estado</span>,
    cell: ({ row }) => {
      // Get the index of the row to determine if it's the most recent
      const rowIndex = row.index;

      return rowIndex === 0 ? (
        <Badge variant='default' className='bg-green-500 hover:bg-green-600'>
          Actual
        </Badge>
      ) : (
        <Badge variant='outline'>Histórico</Badge>
      );
    }
  },
  {
    accessorKey: 'dollarExchangeRate',
    header: () => <span className='font-bold'>Tasa de Cambio del Dólar</span>,
    cell: ({ row }) => {
      const dollarExchangeRate = row.getValue('dollarExchangeRate') as number;
      return <div className='font-medium'>{dollarExchangeRate.toFixed(2)}</div>;
    }
  },
  {
    accessorKey: 'interestRate',
    header: () => <span className='font-bold'>Tasa de Interés</span>,
    cell: ({ row }) => {
      const interestRate = row.getValue('interestRate') as number;
      return <div className='font-medium'>{interestRate.toFixed(2)}%</div>;
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
