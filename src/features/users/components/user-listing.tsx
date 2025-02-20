'use client';

import React from 'react';
import { DataTable as UsersTable } from '@/components/ui/table/data-table';
import { UserColumns } from './user-columns';
import { User } from 'types/User';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

interface UserListingPageProps {
  users: User[];
  totalItems: number;
  isLoading?: boolean;
  setUserToDelete: (user: User) => void;
}

export default function UserListingPage({
  users,
  totalItems,
  isLoading,
  setUserToDelete
}: UserListingPageProps) {
  if (isLoading) {
    return <DataTableSkeleton columnCount={6} rowCount={10} />;
  }

  if (!users || users.length === 0) {
    return <div>No hay usuarios disponibles.</div>;
  }

  return (
    <UsersTable
      columns={UserColumns(setUserToDelete)}
      data={users}
      totalItems={totalItems}
    />
  );
}
