'use client';

import React from 'react';
import { DataTable as ClientsTable } from '@/components/ui/table/data-table';
import { ClientColumns } from './client-columns';
import { Client } from 'types/Client';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

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
  if (isLoading) {
    return <DataTableSkeleton columnCount={6} rowCount={10} />;
  }

  if (!clients || clients.length === 0) {
    return <div>No hay clientes disponibles.</div>;
  }

  return (
    <ClientsTable
      columns={ClientColumns()}
      data={clients}
      totalItems={totalItems}
    />
  );
}
