'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Building, User, UserCog, Briefcase } from 'lucide-react';
import { LoanRequest, LoanRequestStatus } from 'types/LoanRequests';
import { Badge } from '@/components/ui/badge';
import { formatHNL } from '@/utils/formatCurrency';
import { formatLoanRequestId } from '@/utils/formatId';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { UserRole } from 'types/User';
import {
  translateStatus,
  getStatusVariant,
  getStatusClassName
} from '@/utils/getStatusColor';
import { translateIncomeType } from '@/utils/translateIncomeType';

export const LoanRequestColumns = (
  viewMode: 'assigned' | 'all' = 'assigned',
  isAdmin: boolean = false,
  userRole?: UserRole
): ColumnDef<LoanRequest>[] => {
  const showManagerColumn = isAdmin || viewMode === 'all';
  const isBranchManager = userRole === UserRole.BranchManager;

  const getStatusText = (status: LoanRequestStatus) => {
    return translateStatus(status);
  };

  const baseColumns: ColumnDef<LoanRequest>[] = [
    {
      accessorKey: 'id',
      header: () => <span className='font-bold'>ID</span>,
      cell: ({ row }) => (
        <span className='font-medium'>
          {formatLoanRequestId(row.original.id)}
        </span>
      )
    },
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
      header: () => <span className='font-bold'>DNI</span>,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <span>{row.original.dni}</span>
          {row.original.clientName && (
            <span className='text-gray-500'>- {row.original.clientName}</span>
          )}
        </div>
      )
    },
    // {
    //   accessorKey: 'city',
    //   header: () => <span className='font-bold'>Ciudad</span>
    // },
    {
      accessorKey: 'vehicleTypeName',
      header: () => <span className='font-bold'>Tipo de Vehículo</span>
    },
    // {
    //   accessorKey: 'vehicleBrand',
    //   header: () => <span className='font-bold'>Marca</span>
    // },
    // {
    //   accessorKey: 'vehicleModel',
    //   header: () => <span className='font-bold'>Modelo</span>
    // },
    {
      accessorKey: 'vehicleYear',
      header: () => <span className='font-bold'>Año</span>
    },
    {
      accessorKey: 'requestedAmount',
      header: () => <span className='font-bold'>Valor del Vehículo</span>,
      cell: ({ row }) => <span>{formatHNL(row.original.requestedAmount)}</span>
    },
    {
      accessorKey: 'createdAt',
      header: () => <span className='font-bold'>Fecha de Solicitud</span>,
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt') as string;
        const date = new Date(createdAt);

        return (
          <div className='font-medium'>
            {format(date, 'PPpp', { locale: es })}
          </div>
        );
      }
    },
    {
      accessorKey: 'status',
      header: () => <span className='font-bold'>Estado</span>,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={getStatusVariant(status)}
            className={`min-w-[180px] justify-center ${getStatusClassName(status)}`}
          >
            {getStatusText(status)}
          </Badge>
        );
      }
    }
  ];

  // Columna de tipo de ingreso que se mostrará solo para gerentes de agencia
  const incomeTypeColumn: ColumnDef<LoanRequest> = {
    accessorKey: 'incomeType',
    header: () => <span className='font-bold'>Tipo de Ingreso</span>,
    cell: ({ row }) => {
      const incomeType = row.original.incomeType;
      return (
        <div className='flex items-center gap-2'>
          <Briefcase className='h-4 w-4 text-amber-500 dark:text-amber-400' />
          <span className='font-medium'>{translateIncomeType(incomeType)}</span>
        </div>
      );
    }
  };

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

  // Construir el array final de columnas
  const finalColumns = [...baseColumns];

  // Ubicación específica para insertar la columna incomeType (justo antes de createdAt)
  // Asumiendo que las columnas se mantienen en el mismo orden que se definieron
  // la columna createdAt está en la posición 8 (0-based index) en baseColumns
  const createdAtColumnIndex = 8;

  // Insertar la columna de tipo de ingreso antes de fecha de solicitud si el usuario es gerente de agencia
  if (isBranchManager) {
    finalColumns.splice(createdAtColumnIndex, 0, incomeTypeColumn);
  }

  // Agregar la columna de manager después de status si es necesario
  if (showManagerColumn) {
    finalColumns.push(managerColumn);
  }

  return finalColumns;
};
