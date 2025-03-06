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
import { MoreHorizontal, Building, UserCog } from 'lucide-react';
import { Dealership } from 'types/Dealerships';
import { Badge } from '@/components/ui/badge';

export const DealershipColumns = (
  setDealershipToEdit: (dealership: Dealership) => void,
  setDealershipToDelete: (dealership: Dealership) => void,
  setDealershipToRestore: (dealership: Dealership) => void
): ColumnDef<Dealership>[] => [
  {
    accessorKey: 'name',
    header: () => <span className='font-bold'>Nombre</span>,
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <Building className='h-4 w-4 text-blue-500 dark:text-blue-400' />
        <span className='font-medium text-blue-700 dark:text-blue-300'>
          {row.original.name}
        </span>
      </div>
    )
  },
  {
    accessorKey: 'managerName',
    header: () => <span className='font-bold'>Responsable</span>,
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <UserCog className='h-4 w-4 text-purple-500 dark:text-purple-400' />
        <span className='font-medium text-purple-700 dark:text-purple-300'>
          {row.original.managerName || 'Sin asignar'}
        </span>
      </div>
    )
  },
  {
    accessorKey: 'email',
    header: () => <span className='font-bold'>Correo Electrónico</span>
  },
  {
    accessorKey: 'phoneNumber',
    header: () => <span className='font-bold'>Número de Teléfono</span>
  },
  {
    accessorKey: 'address',
    header: () => <span className='font-bold'>Dirección</span>
  },
  {
    accessorKey: 'isActive',
    header: () => <span className='font-bold'>Estado</span>,
    cell: ({ row }) => {
      if (row.original.isDeleted) {
        return <Badge variant='destructive'>Eliminado</Badge>;
      }
      return (
        <Badge variant={row.original.isActive ? 'success' : 'secondary'}>
          {row.original.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    }
  },
  {
    id: 'actions',
    header: function DealershipActionsHeader() {
      return <span className='font-bold'>Acciones</span>;
    },
    cell: function DealershipActionsCell({ row }) {
      const dealership = row.original;

      function handleEditClick() {
        setDealershipToEdit(dealership);
      }

      function handleDeleteClick() {
        setDealershipToDelete(dealership);
      }

      function handleRestoreClick() {
        setDealershipToRestore(dealership);
      }

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
            {dealership.isDeleted ? (
              <DropdownMenuItem onClick={handleRestoreClick}>
                Restaurar
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={handleEditClick}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteClick}>
                  Eliminar
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
