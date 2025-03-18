'use client';

import React from 'react';
import { DataTable as ClientsTable } from '@/components/ui/table/data-table';
import { ClientColumns } from './client-columns';
import { Client } from 'types/Client';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useRouter } from 'next/navigation';
import { useClientStore } from '@/stores/client-store';
import { Row } from '@tanstack/react-table';

interface ClientListingPageProps {
  clients: Client[];
  totalItems: number;
  isLoading?: boolean;
}

export default function ClientListingPage({
  clients,
  totalItems,
  isLoading
}: ClientListingPageProps) {
  const router = useRouter();
  const { setSelectedClient } = useClientStore();

  if (isLoading) {
    return <DataTableSkeleton columnCount={6} rowCount={10} />;
  }

  if (!clients || clients.length === 0) {
    return <div>No hay clientes disponibles.</div>;
  }

  // Function to handle row click
  const handleRowClick = (row: Row<Client>) => {
    const client = row.original;
    setSelectedClient(client);
    router.push(`/dashboard/clients/${client.id}`);
  };

  return (
    <ClientsTable
      columns={ClientColumns(handleRowClick)}
      data={clients}
      totalItems={totalItems}
      onRowClick={handleRowClick}
    />
  );
}
