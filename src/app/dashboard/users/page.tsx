'use client';

import { useState } from 'react';
import { PlusIcon, ReloadIcon } from '@radix-ui/react-icons';
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
import { useUserStore } from '@/stores/user-store';
import UserForm from '@/features/users/components/user-form';
import KBar from '@/components/kbar';
import { toast } from 'sonner';

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
  const { userToEdit, userToDelete, setUserToDelete } = useUserStore();

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDeleteUser = async (): Promise<void> => {
    if (!userToDelete) return;

    deleteUserMutation.mutate(userToDelete.id, {
      onSuccess: () => {
        setUserToDelete(null);
        toast.success('Usuario eliminado correctamente.');
      }
    });
  };

  const handleCloseDeleteModal = () => {
    setUserToDelete(null);
    deleteUserMutation.reset(); // Reset the mutation state when closing the modal
  };

  const handleOpenChange = (open: boolean) => setIsFormOpen(open);

  const kbarActions = {
    openUserForm: () => setIsFormOpen(true)
  };

  return (
    <KBar actions={kbarActions}>
      <PageContainer scrollable={false}>
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading
              title='Usuarios'
              description='Administración de usuarios.'
            />
            <div className='flex gap-2'>
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
              <Button variant='default' onClick={() => setIsFormOpen(true)}>
                <PlusIcon className='mr-2 h-4 w-4' />
                Agregar Usuario
              </Button>
            </div>
          </div>

          <Separator />

          {error ? (
            <div className='space-y-4'>
              <ErrorAlert error={error?.message || String(error)} />
            </div>
          ) : (
            <>
              <UserListingPage
                users={users || []}
                totalItems={users?.length || 0}
                isLoading={isLoading || !users}
              />
              <UserForm
                open={isFormOpen || !!userToEdit}
                onOpenChange={handleOpenChange}
              />
              <AlertModal
                isOpen={!!userToDelete}
                loading={deleteUserMutation.isPending}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDeleteUser}
                error={
                  deleteUserMutation.error
                    ? String(deleteUserMutation.error)
                    : null
                }
                title='Eliminar Usuario'
                description={`¿Está seguro que desea eliminar el usuario "${userToDelete?.name}"? Esta acción no se puede deshacer.`}
                confirmLabel='Eliminar'
                cancelLabel='Cancelar'
              />
            </>
          )}
        </div>
      </PageContainer>
    </KBar>
  );
}

export default function UsersPage() {
  return <UserContent />;
}
