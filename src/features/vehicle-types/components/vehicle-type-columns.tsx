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
import { VehicleType } from 'types/VehicleTypes';
import { Badge } from '@/components/ui/badge';

export const VehicleTypeColumns = (
  setVehicleTypeToEdit: (vehicleType: VehicleType) => void
): ColumnDef<VehicleType>[] => [
  {
    accessorKey: 'name',
    header: () => <span className='font-bold'>Nombre</span>
  },
  {
    accessorKey: 'maxLoanTermMonths',
    header: () => <span className='font-bold'>Plazo Máximo (meses)</span>,
    cell: ({ row }) => <span>{row.original.maxLoanTermMonths} meses</span>
  },
  {
    accessorKey: 'isActive',
    header: () => <span className='font-bold'>Estado</span>,
    cell: ({ row }) => {
      return (
        <Badge variant={row.original.isActive ? 'success' : 'secondary'}>
          {row.original.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    }
  },
  {
    id: 'actions',
    header: function VehicleTypeActionsHeader() {
      return <span className='font-bold'>Acciones</span>;
    },
    cell: function VehicleTypeActionsCell({ row }) {
      const vehicleType = row.original;

      function handleEditClick() {
        setVehicleTypeToEdit(vehicleType);
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
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
