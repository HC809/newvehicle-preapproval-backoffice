'use client';

import React from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, User, Phone, MapPin } from 'lucide-react';
import { Client } from 'types/Client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type ClientColumnsType = (
  onRowClick: (row: Row<Client>) => void
) => ColumnDef<Client>[];

export const ClientColumns: ClientColumnsType = (onRowClick) => {
  return [
    {
      accessorKey: 'name',
      header: () => <span className='font-bold'>Nombre</span>,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <User className='h-4 w-4 text-blue-500 dark:text-blue-400' />
          <span className='font-medium'>{row.original.name}</span>
        </div>
      )
    },
    {
      accessorKey: 'dni',
      header: () => <span className='font-bold'>DNI</span>,
      cell: ({ row }) => row.original.dni
    },
    {
      accessorKey: 'lastRiskScore',
      header: () => <span className='font-bold'>Scoring de Riesgo</span>,
      cell: ({ row }) => {
        const score = row.original.lastRiskScore;
        let variant: 'default' | 'success' | 'destructive' | 'warning' =
          'default';

        if (score >= 700) {
          variant = 'success';
        } else if (score >= 500) {
          variant = 'warning';
        } else {
          variant = 'destructive';
        }

        return <Badge variant={variant}>{score}</Badge>;
      }
    },
    {
      accessorKey: 'phone',
      header: () => <span className='font-bold'>Teléfono</span>,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <Phone className='h-4 w-4 text-purple-500 dark:text-purple-400' />
          <span>{row.original.phone}</span>
        </div>
      )
    },
    {
      accessorKey: 'city',
      header: () => <span className='font-bold'>Ciudad</span>,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <MapPin className='h-4 w-4 text-orange-500 dark:text-orange-400' />
          <span>{row.original.city}</span>
        </div>
      )
    },
    {
      accessorKey: 'createdAt',
      header: () => <span className='font-bold'>Fecha Creación</span>,
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
      accessorKey: 'updatedAt',
      header: () => <span className='font-bold'>Última Actualización</span>,
      cell: ({ row }) => {
        const updatedAt = row.getValue('updatedAt') as string;
        const date = new Date(updatedAt);

        return (
          <div className='font-medium'>
            {format(date, 'PPpp', { locale: es })}
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: () => <span className='font-bold'>Acciones</span>,
      cell: ({ row }) => {
        const handleActionClick = (e: React.MouseEvent) => {
          e.stopPropagation();
        };

        return (
          <div onClick={handleActionClick}>
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
                <DropdownMenuItem onClick={() => onRowClick(row)}>
                  Ver Detalle
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    }
  ];
};
