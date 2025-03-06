'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Building, User, UserCog } from 'lucide-react';
import { LoanRequest } from 'types/LoanRequests';
import { Badge } from '@/components/ui/badge';

export const LoanRequestColumns = (
  viewMode: 'assigned' | 'all' = 'assigned',
  isAdmin: boolean = false
): ColumnDef<LoanRequest>[] => {
  const showManagerColumn = isAdmin || viewMode === 'all';

  const baseColumns: ColumnDef<LoanRequest>[] = [
    {
      accessorKey: 'dealershipName',
      header: () => <span className='font-bold'>Concesionaria</span>,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Building className='h-4 w-4 text-blue-500 dark:text-blue-400' />
          <span className='font-medium text-blue-700 dark:text-blue-300'>
            {row.original.dealershipName}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'creatorName',
      header: () => <span className='font-bold'>Creado por</span>,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <User className='h-4 w-4 text-green-500 dark:text-green-400' />
          <span className='font-medium text-green-700 dark:text-green-300'>
            {row.original.creatorName}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'dni',
      header: () => <span className='font-bold'>DNI</span>
    },
    {
      accessorKey: 'city',
      header: () => <span className='font-bold'>Ciudad</span>
    },
    {
      accessorKey: 'vehicleTypeName',
      header: () => <span className='font-bold'>Tipo de Vehículo</span>
    },
    {
      accessorKey: 'vehicleBrand',
      header: () => <span className='font-bold'>Marca</span>
    },
    {
      accessorKey: 'vehicleModel',
      header: () => <span className='font-bold'>Modelo</span>
    },
    {
      accessorKey: 'vehicleYear',
      header: () => <span className='font-bold'>Año</span>
    },
    {
      accessorKey: 'requestedAmount',
      header: () => <span className='font-bold'>Monto Solicitado</span>,
      cell: ({ row }) => (
        <span>
          ${' '}
          {row.original.requestedAmount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      )
    },
    // {
    //   accessorKey: 'requestedLoanTermMonths',
    //   header: () => <span className='font-bold'>Plazo Máximo</span>,
    //   cell: ({ row }) => <span>{row.original.requestedLoanTermMonths} meses</span>
    // },
    {
      accessorKey: 'status',
      header: () => <span className='font-bold'>Estado</span>,
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: 'default' | 'success' | 'destructive' | 'secondary' =
          'default';

        switch (status) {
          case 'Approved':
            variant = 'success';
            break;
          case 'Rejected':
            variant = 'destructive';
            break;
          case 'Pending':
            variant = 'secondary';
            break;
          default:
            variant = 'default';
        }

        const statusText =
          {
            Approved: 'Aprobado',
            Rejected: 'Rechazado',
            Pending: 'Pendiente'
          }[status] || status;

        return <Badge variant={variant}>{statusText}</Badge>;
      }
    }
  ];

  // Columna de responsable que se mostrará condicionalmente
  const managerColumn: ColumnDef<LoanRequest> = {
    accessorKey: 'managerName',
    header: () => <span className='font-bold'>Responsable</span>,
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <UserCog className='h-4 w-4 text-purple-500 dark:text-purple-400' />
        <span className='font-medium text-purple-700 dark:text-purple-300'>
          {row.original.managerName}
        </span>
      </div>
    )
  };

  // Columna de acciones que siempre se mostrará al final
  const actionsColumn: ColumnDef<LoanRequest> = {
    id: 'actions',
    header: function LoanRequestActionsHeader() {
      return <span className='font-bold'>Acciones</span>;
    },
    cell: function LoanRequestActionsCell({ row }) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  };

  // Construir el array final de columnas
  const finalColumns = [...baseColumns];

  // Agregar la columna de manager después de status si es necesario
  if (showManagerColumn) {
    finalColumns.push(managerColumn);
  }

  // Agregar la columna de acciones al final
  finalColumns.push(actionsColumn);

  return finalColumns;
};
