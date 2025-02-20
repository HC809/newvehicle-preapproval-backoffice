'use client';

import { useState } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import useAxios from '@/hooks/use-axios';
import ErrorAlert from '@/components/custom/error-alert';
import UserListingPage from '@/features/users/components/user-listing';
import { AlertModal } from '@/components/modal/alert-modal';
import { useUsers, useDeleteUser } from '@/features/users/api/user-service';
import { getErrorMessage } from '@/utils/error-utils';
import { User } from 'types/User';

function UserContent() {
  const apiClient = useAxios();
  const {
    isLoading,
    isFetching,
    data: users,
    error,
    refetch
  } = useUsers(apiClient);
  const deleteUserMutation = useDeleteUser(apiClient);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleDeleteUser = async (): Promise<void> => {
    if (!userToDelete) return;

    deleteUserMutation.mutate(userToDelete.id, {
      onSuccess: () => {
        setUserToDelete(null);
      }
    });
  };

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='Usuarios' description='Administración de usuarios.' />
          <Button
            variant='default'
            size='icon'
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <ReloadIcon
              className={cn('h-4 w-4', isFetching && 'animate-spin')}
            />
          </Button>
        </div>

        <Separator />

        {error ? (
          <div className='space-y-4'>
            <ErrorAlert error={getErrorMessage(error as Error)} />
          </div>
        ) : (
          <>
            <UserListingPage
              users={users || []}
              totalItems={users?.length || 0}
              isLoading={isLoading || !users}
              setUserToDelete={setUserToDelete}
            />
            <AlertModal
              isOpen={!!userToDelete}
              loading={deleteUserMutation.isPending}
              onClose={() => setUserToDelete(null)}
              onConfirm={handleDeleteUser}
              error={deleteUserMutation.error?.message}
              title='Eliminar Usuario'
              description={`¿Está seguro que desea eliminar el usuario "${userToDelete?.name}"? Esta acción no se puede deshacer.`}
              confirmLabel='Eliminar'
              cancelLabel='Cancelar'
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}

export default function UsersPage() {
  return <UserContent />;
}
