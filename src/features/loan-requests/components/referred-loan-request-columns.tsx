'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Building, User, UserCog, Info } from 'lucide-react';
import { LoanRequest, LoanRequestStatus } from 'types/LoanRequests';
import { Badge } from '@/components/ui/badge';
import { formatLoanRequestId } from '@/utils/formatId';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { UserRole } from 'types/User';
import { translateRole } from '@/utils/translateRole';
import { formatPhoneNumber } from '@/utils/formatPhoneNumber';
import {
  translateStatus,
  getStatusVariant,
  getStatusClassName
} from '@/utils/getStatusColor';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';

export const ReferredLoanRequestColumns = (
  userRole?: UserRole,
  onAssignClick?: (loanRequest: LoanRequest) => void
): ColumnDef<LoanRequest>[] => {
  const showReferralColumn =
    userRole === UserRole.BusinessDevelopment_Admin ||
    userRole === UserRole.BusinessDevelopment_User;

  // Función para obtener el estado de la solicitud según isAssigned
  const getDisplayStatus = (
    status: LoanRequestStatus,
    isAssigned?: boolean
  ) => {
    if (status === LoanRequestStatus.Pending && !isAssigned) {
      return 'Sin Asignar';
    }
    return translateStatus(status);
  };

  // Función para obtener la variante del badge según el estado
  const getStatusBadgeVariant = (
    status: LoanRequestStatus,
    isAssigned?: boolean
  ) => {
    if (status === LoanRequestStatus.Pending && !isAssigned) {
      return 'secondary';
    }
    return getStatusVariant(status);
  };

  // Función para obtener las clases CSS del badge
  const getStatusBadgeClasses = (
    status: LoanRequestStatus,
    isAssigned?: boolean
  ) => {
    if (status === LoanRequestStatus.Pending && !isAssigned) {
      return 'bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700';
    }
    return getStatusClassName(status);
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
      cell: ({ row }) => {
        const isAssigned = row.original.isAssigned;

        if (!isAssigned) {
          return (
            <div className='flex items-center gap-2'>
              <Building className='h-4 w-4 text-gray-500 dark:text-gray-400' />
              <span className='font-medium text-gray-500 dark:text-gray-400'>
                Sin Asignar
              </span>
            </div>
          );
        }

        return (
          <div className='flex items-center gap-2'>
            <Building className='h-4 w-4 text-blue-500 dark:text-blue-400' />
            <span className='font-medium text-blue-700 dark:text-blue-300'>
              {row.original.dealershipName}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'dealershipAdminName',
      header: () => <span className='font-bold'>Vendedor</span>,
      cell: ({ row }) => {
        const isAssigned = row.original.isAssigned;

        if (!isAssigned) {
          return (
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-gray-500 dark:text-gray-400' />
              <span className='font-medium text-gray-500 dark:text-gray-400'>
                Sin Asignar
              </span>
            </div>
          );
        }

        return (
          <div className='flex items-center gap-2'>
            <User className='h-4 w-4 text-green-500 dark:text-green-400' />
            <span className='font-medium text-green-700 dark:text-green-300'>
              {row.original.dealershipAdminName}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'dni',
      header: () => <span className='font-bold'>DNI</span>,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <UserCog className='h-4 w-4 text-purple-500 dark:text-purple-400' />
          <div className='flex flex-col'>
            <span className='font-medium text-purple-700 dark:text-purple-300'>
              {row.original.dni}
            </span>
            {row.original.clientName && (
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                {row.original.clientName}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      accessorKey: 'phoneNumber',
      header: () => <span className='font-bold'>Teléfono</span>,
      cell: ({ row }) => {
        const phoneNumber = row.original.phoneNumber;

        if (!phoneNumber || phoneNumber.trim() === '') {
          return (
            <span className='text-sm text-gray-400 dark:text-gray-500'>
              Sin teléfono
            </span>
          );
        }

        return (
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-600 dark:text-gray-300'>
              {formatPhoneNumber(phoneNumber)}
            </span>
          </div>
        );
      }
    },
    {
      accessorKey: 'comment',
      header: () => <span className='font-bold'>Información del Referido</span>,
      cell: ({ row }) => {
        const comment = row.original.comment || '';
        const truncatedComment =
          comment.length > 50 ? `${comment.substring(0, 50)}...` : comment;

        return (
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className='cursor-help'>
                <div className='text-xs text-gray-600 dark:text-gray-400'>
                  {truncatedComment.split('\n').map((line, index) => (
                    <div key={index} className='line-clamp-2'>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent
              className='max-h-40 w-80 overflow-y-auto border-[#013B7C] bg-[#013B7C] text-white'
              side='top'
            >
              <div className='whitespace-pre-line text-sm'>
                {comment || 'Sin información adicional'}
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      }
    },
    {
      accessorKey: 'createdAt',
      header: () => <span className='font-bold'>Fecha de Solicitud</span>,
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span className='text-sm text-gray-600 dark:text-gray-300'>
            {format(date, 'dd/MM/yyyy HH:mm', { locale: es })}
          </span>
        );
      }
    },
    {
      accessorKey: 'status',
      header: () => <span className='font-bold'>Estado</span>,
      cell: ({ row }) => {
        const status = row.original.status;
        const isAssigned = row.original.isAssigned;
        const displayStatus = getDisplayStatus(status, isAssigned);
        const badgeVariant = getStatusBadgeVariant(status, isAssigned);
        const badgeClasses = getStatusBadgeClasses(status, isAssigned);

        return (
          <Badge variant={badgeVariant as any} className={badgeClasses}>
            {displayStatus}
          </Badge>
        );
      }
    }
  ];

  // Agregar columna de referido solo para usuarios con roles específicos
  if (showReferralColumn) {
    baseColumns.push({
      accessorKey: 'referredName',
      header: () => <span className='font-bold'>Referido</span>,
      cell: ({ row }) => {
        const referredName = row.original.referredName;
        const referredId = row.original.referredId;

        if (!referredName && !referredId) {
          return (
            <span className='text-sm text-gray-400 dark:text-gray-500'>
              No especificado
            </span>
          );
        }

        return (
          <div className='flex items-center gap-2'>
            <Info className='h-4 w-4 text-blue-500 dark:text-blue-400' />
            <div className='flex flex-col'>
              <span className='font-medium text-blue-700 dark:text-blue-300'>
                {referredName || 'Sin nombre'}
              </span>
              {row.original.referredRole && (
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  {translateRole[row.original.referredRole as UserRole]}
                </span>
              )}
            </div>
          </div>
        );
      }
    });
  }

  // Agregar columna de acción "Asignar" solo para gestores
  const showAssignColumn =
    userRole === UserRole.BusinessDevelopment_Admin ||
    userRole === UserRole.BusinessDevelopment_User;

  if (showAssignColumn) {
    baseColumns.push({
      accessorKey: 'actions',
      header: () => <span className='font-bold'>Acciones</span>,
      cell: ({ row }) => {
        return (
          <div className='flex items-center justify-center'>
            <Button
              variant='default'
              size='sm'
              className='bg-blue-600 text-white hover:bg-blue-700'
              onClick={() => {
                if (onAssignClick) {
                  onAssignClick(row.original);
                }
              }}
            >
              Asignar
            </Button>
          </div>
        );
      }
    });
  }

  return baseColumns;
};
