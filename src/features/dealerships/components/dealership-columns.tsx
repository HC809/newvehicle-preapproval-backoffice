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
import { MoreHorizontal } from 'lucide-react';
import { Dealership } from 'types/Dealerships';

export const DealershipColumns = (
  setDealershipToEdit: (dealership: Dealership) => void,
  setDealershipToDelete: (dealership: Dealership) => void
): ColumnDef<Dealership>[] => [
  {
    accessorKey: 'name',
    header: () => <span className='font-bold'>Nombre</span>
  },
  {
    accessorKey: 'address',
    header: () => <span className='font-bold'>Dirección</span>
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
            <DropdownMenuItem onClick={handleEditClick}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteClick}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
