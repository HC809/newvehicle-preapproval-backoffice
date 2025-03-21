'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Building, User, UserCog, Check, X } from 'lucide-react';
import { LoanRequest, LoanRequestStatus } from 'types/LoanRequests';
import { Badge } from '@/components/ui/badge';
import { formatUSD } from '@/utils/formatCurrency';
import { formatLoanRequestId } from '@/utils/formatId';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { UserRole } from 'types/User';

export const LoanRequestColumns = (
  viewMode: 'assigned' | 'all' = 'assigned',
  isAdmin: boolean = false,
  userRole?: UserRole
): ColumnDef<LoanRequest>[] => {
  const showManagerColumn = isAdmin || viewMode === 'all';

  const getStatusVariant = (status: LoanRequestStatus) => {
    switch (status) {
      case LoanRequestStatus.ApprovedByAgent:
        return 'success';
      case LoanRequestStatus.ApprovedByManager:
        return 'success';
      case LoanRequestStatus.RejectedByAgent:
        return 'destructive';
      case LoanRequestStatus.RejectedByManager:
        return 'destructive';
      case LoanRequestStatus.AcceptedByCustomer:
        return 'default';
      case LoanRequestStatus.DeclinedByCustomer:
        return 'secondary';
      case LoanRequestStatus.Pending:
        return 'warning';
      case LoanRequestStatus.Cancelled:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: LoanRequestStatus) => {
    switch (status) {
      case LoanRequestStatus.Pending:
        return 'Pendiente';
      case LoanRequestStatus.ApprovedByAgent:
        return 'Apr. Oficial Neg.';
      case LoanRequestStatus.RejectedByAgent:
        return 'Rech. Oficial Neg.';
      case LoanRequestStatus.ApprovedByManager:
        return 'Apr. Gerente Neg.';
      case LoanRequestStatus.RejectedByManager:
        return 'Rech. Gerente Neg.';
      case LoanRequestStatus.AcceptedByCustomer:
        return 'Aceptado por Cliente';
      case LoanRequestStatus.DeclinedByCustomer:
        return 'Desistió';
      case LoanRequestStatus.Cancelled:
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusClassName = (status: LoanRequestStatus) => {
    switch (status) {
      case LoanRequestStatus.ApprovedByManager:
        return 'bg-green-700 text-white hover:bg-green-800 dark:bg-green-800 dark:hover:bg-green-900';
      case LoanRequestStatus.RejectedByManager:
        return 'bg-red-700 text-white hover:bg-red-800 dark:bg-red-800 dark:hover:bg-red-900';
      case LoanRequestStatus.AcceptedByCustomer:
        return 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800';
      case LoanRequestStatus.DeclinedByCustomer:
        return 'bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700';
      default:
        return '';
    }
  };

  const canApproveReject = (request: LoanRequest) => {
    if (!userRole) return false;

    const isBusinessDevUser = userRole === UserRole.BusinessDevelopment_User;
    const isBusinessDevAdmin = userRole === UserRole.BusinessDevelopment_Admin;

    if (isBusinessDevUser) {
      return request.status === LoanRequestStatus.Pending;
    }

    if (isBusinessDevAdmin) {
      return request.status === LoanRequestStatus.ApprovedByAgent;
    }

    return false;
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
      header: () => <span className='font-bold'>DNI</span>
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
      cell: ({ row }) => <span>{formatUSD(row.original.requestedAmount)}</span>
    },
    // {
    //   accessorKey: 'monthlyIncome',
    //   header: () => <span className='font-bold'>Ingreso Mensual</span>,
    //   cell: ({ row }) => (
    //     <span>
    //       {formatHNL(row.original.monthlyIncome)}
    //     </span>
    //   )
    // },
    {
      accessorKey: 'status',
      header: () => <span className='font-bold'>Estado</span>,
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={getStatusVariant(status)}
            className={getStatusClassName(status)}
          >
            {getStatusText(status)}
          </Badge>
        );
      }
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
      const request = row.original;
      const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
      };

      if (!canApproveReject(request)) {
        return null;
      }

      return (
        <div onClick={handleActionClick} className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            className='h-8 px-2'
            onClick={() => {
              // TODO: Implement approve action
            }}
          >
            <Check className='h-4 w-4 text-green-500' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='h-8 px-2'
            onClick={() => {
              // TODO: Implement reject action
            }}
          >
            <X className='h-4 w-4 text-red-500' />
          </Button>
        </div>
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
