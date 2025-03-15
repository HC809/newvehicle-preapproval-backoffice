'use client';

import React, { useCallback, useMemo } from 'react';
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
import { MoreHorizontal, User, Phone, Mail, MapPin } from 'lucide-react';
import { Client } from 'types/Client';
import { useRouter } from 'next/navigation';
import { useClientStore } from '@/stores/client-store';

// Create a separate component for the cell content to avoid React hook issues
function ClientNameCell({
  client,
  onClick
}: {
  client: Client;
  onClick: (client: Client) => void;
}) {
  return (
    <div
      className='flex cursor-pointer items-center gap-2'
      onClick={() => onClick(client)}
    >
      <User className='h-4 w-4 text-blue-500 dark:text-blue-400' />
      <span className='font-medium'>{client.name}</span>
    </div>
  );
}

function ClientDniCell({
  client,
  onClick
}: {
  client: Client;
  onClick: (client: Client) => void;
}) {
  return (
    <div className='cursor-pointer' onClick={() => onClick(client)}>
      {client.dni}
    </div>
  );
}

function ClientEmailCell({
  client,
  onClick
}: {
  client: Client;
  onClick: (client: Client) => void;
}) {
  return (
    <div
      className='flex cursor-pointer items-center gap-2'
      onClick={() => onClick(client)}
    >
      <Mail className='h-4 w-4 text-green-500 dark:text-green-400' />
      <span>{client.email}</span>
    </div>
  );
}

function ClientPhoneCell({
  client,
  onClick
}: {
  client: Client;
  onClick: (client: Client) => void;
}) {
  return (
    <div
      className='flex cursor-pointer items-center gap-2'
      onClick={() => onClick(client)}
    >
      <Phone className='h-4 w-4 text-purple-500 dark:text-purple-400' />
      <span>{client.phone}</span>
    </div>
  );
}

function ClientAddressCell({
  client,
  onClick
}: {
  client: Client;
  onClick: (client: Client) => void;
}) {
  return (
    <div
      className='flex cursor-pointer items-center gap-2'
      onClick={() => onClick(client)}
    >
      <MapPin className='h-4 w-4 text-orange-500 dark:text-orange-400' />
      <span className='max-w-[200px] truncate'>{client.address}</span>
    </div>
  );
}

function ClientRiskScoreCell({
  client,
  onClick
}: {
  client: Client;
  onClick: (client: Client) => void;
}) {
  const score = client.lastRiskScore;
  let variant: 'default' | 'success' | 'destructive' | 'warning' = 'default';

  if (score >= 700) {
    variant = 'success';
  } else if (score >= 500) {
    variant = 'warning';
  } else {
    variant = 'destructive';
  }

  return (
    <div className='cursor-pointer' onClick={() => onClick(client)}>
      <Badge variant={variant}>{score}</Badge>
    </div>
  );
}

function ClientActionsCell({
  client,
  onClick
}: {
  client: Client;
  onClick: (client: Client) => void;
}) {
  // Evitar que el clic en el menú de acciones propague al clic de la fila
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
          <DropdownMenuItem onClick={() => onClick(client)}>
            Ver Detalle
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ClientColumns(): ColumnDef<Client>[] {
  const router = useRouter();
  const { setSelectedClient } = useClientStore();

  // Use useCallback to memoize the handler function
  const handleRowClick = useCallback(
    (client: Client) => {
      setSelectedClient(client);
      router.push(`/dashboard/clients/${client.id}`);
    },
    [router, setSelectedClient]
  );

  return useMemo(
    () => [
      {
        accessorKey: 'name',
        header: () => <span className='font-bold'>Nombre</span>,
        cell: ({ row }) => (
          <ClientNameCell client={row.original} onClick={handleRowClick} />
        )
      },
      {
        accessorKey: 'dni',
        header: () => <span className='font-bold'>DNI</span>,
        cell: ({ row }) => (
          <ClientDniCell client={row.original} onClick={handleRowClick} />
        )
      },
      {
        accessorKey: 'email',
        header: () => <span className='font-bold'>Correo Electrónico</span>,
        cell: ({ row }) => (
          <ClientEmailCell client={row.original} onClick={handleRowClick} />
        )
      },
      {
        accessorKey: 'phone',
        header: () => <span className='font-bold'>Teléfono</span>,
        cell: ({ row }) => (
          <ClientPhoneCell client={row.original} onClick={handleRowClick} />
        )
      },
      {
        accessorKey: 'address',
        header: () => <span className='font-bold'>Dirección</span>,
        cell: ({ row }) => (
          <ClientAddressCell client={row.original} onClick={handleRowClick} />
        )
      },
      {
        accessorKey: 'lastRiskScore',
        header: () => <span className='font-bold'>Puntuación de Riesgo</span>,
        cell: ({ row }) => (
          <ClientRiskScoreCell client={row.original} onClick={handleRowClick} />
        )
      },
      {
        id: 'actions',
        header: () => <span className='font-bold'>Acciones</span>,
        cell: ({ row }) => (
          <ClientActionsCell client={row.original} onClick={handleRowClick} />
        )
      }
    ],
    [handleRowClick]
  );
}
