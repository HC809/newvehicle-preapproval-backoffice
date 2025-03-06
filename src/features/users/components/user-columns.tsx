'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Building } from 'lucide-react';
import { User } from 'types/User';
import { roleTranslations } from '@/utils/roleTranslations';
import { verificationTypeTranslations } from '@/utils/verificationTypeTranslations';

export const UserColumns = (
  setUserToEdit: (user: User) => void,
  setUserToDelete: (user: User) => void,
  setUserToRestore: (user: User) => void
): ColumnDef<User>[] => [
  {
    accessorKey: 'name',
    header: () => <span className='font-bold'>Nombre</span>
  },
  {
    accessorKey: 'email',
    header: () => <span className='font-bold'>Correo Electrónico</span>
  },
  {
    accessorKey: 'dealership',
    header: () => <span className='font-bold'>Concesionaria</span>,
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <Building className='h-4 w-4 text-blue-500 dark:text-blue-400' />
        <span className='font-medium text-blue-700 dark:text-blue-300'>
          {row.original.dealership}
        </span>
      </div>
    )
  },
  {
    accessorKey: 'role',
    header: () => <span className='font-bold'>Rol</span>,
    cell: ({ row }) => {
      const role = row.original.role;
      return <span>{roleTranslations[role]}</span>;
    }
  },
  {
    accessorKey: 'verificationType',
    header: () => <span className='font-bold'>Tipo de Verificación</span>,
    cell: ({ row }) => {
      const verificationType = row.original.verificationType;
      return <span>{verificationTypeTranslations[verificationType]}</span>;
    }
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
    header: function UserActionsHeader() {
      return <span className='font-bold'>Acciones</span>;
    },
    cell: function UserActionsCell({ row }) {
      const user = row.original;

      function handleEditClick() {
        setUserToEdit(user);
      }

      function handleDeleteClick() {
        setUserToDelete(user);
      }

      function handleRestoreClick() {
        setUserToRestore(user);
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
            {user.isDeleted ? (
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
