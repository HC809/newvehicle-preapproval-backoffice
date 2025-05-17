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
import { MoreHorizontal, Building, Mail, Pencil, Trash2 } from 'lucide-react';
import { User, UserRole } from 'types/User';
import { translateRole } from '@/utils/translateRole';
import { translateVerificationType } from '@/utils/translateVerificationType';

export const UserColumns = (
  setUserToEdit: (user: User) => void,
  setUserToDelete: (user: User) => void,
  setUserToRestore: (user: User) => void,
  setUserToResendEmail: (user: User) => void
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
      return <span>{translateRole[role]}</span>;
    }
  },
  {
    accessorKey: 'verificationType',
    header: () => <span className='font-bold'>Tipo de Verificación</span>,
    cell: ({ row }) => {
      const verificationType = row.original.verificationType;
      return <span>{translateVerificationType[verificationType]}</span>;
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

      function handleResendEmailClick() {
        setUserToResendEmail(user);
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
                  <Pencil className='mr-2 h-4 w-4' />
                  Editar
                </DropdownMenuItem>
                {user.role === UserRole.Dealership_Admin && (
                  <DropdownMenuItem onClick={handleResendEmailClick}>
                    <Mail className='mr-2 h-4 w-4' />
                    Reenviar enlace de contraseña
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleDeleteClick}>
                  <Trash2 className='mr-2 h-4 w-4' />
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
