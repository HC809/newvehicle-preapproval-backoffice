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
import UserForm from '@/features/users/components/user-form';
import { useUserStore } from '@/stores/user-store';
import { AlertModal } from '@/components/modal/alert-modal';
import {
  useUsers,
  useDeleteUser,
  useRestoreUser
} from '@/features/users/api/user-service';
import { getUserModalProps } from '@/features/users/helpers/modal-helpers';
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
  const restoreUserMutation = useRestoreUser(apiClient);

  const {
    userToEdit,
    userToDelete,
    userToRestore,
    setUserToDelete,
    setUserToEdit,
    setUserToRestore
  } = useUserStore();

  const [isFormOpen, setIsFormOpen] = useState(false);

  const modalAction = userToDelete
    ? 'delete'
    : userToRestore
      ? 'restore'
      : null;

  // Handle confirmation based on the current action
  const handleConfirmAction = async (): Promise<void> => {
    if (modalAction === 'delete' && userToDelete) {
      deleteUserMutation.mutate(userToDelete.id, {
        onSuccess: () => {
          setUserToDelete(null);
          toast.success('Usuario eliminado correctamente.');
          refetch();
        }
      });
    } else if (modalAction === 'restore' && userToRestore) {
      restoreUserMutation.mutate(userToRestore.id, {
        onSuccess: () => {
          setUserToRestore(null);
          toast.success('Usuario restaurado correctamente.');
          refetch();
        }
      });
    }
  };

  // Handle closing the modal based on the current action
  const handleCloseModal = () => {
    if (modalAction === 'delete') {
      setUserToDelete(null);
      deleteUserMutation.reset();
    } else if (modalAction === 'restore') {
      setUserToRestore(null);
      restoreUserMutation.reset();
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setUserToEdit(null);
    }
  };

  const kbarActions = {
    openUserForm: () => setIsFormOpen(true)
  };

  const selectedUser = userToDelete || userToRestore;

  const isModalOpen = Boolean(modalAction);

  const isModalLoading =
    modalAction === 'delete'
      ? deleteUserMutation.isPending
      : restoreUserMutation.isPending;

  const modalError =
    modalAction === 'delete'
      ? deleteUserMutation.error
        ? String(deleteUserMutation.error)
        : null
      : restoreUserMutation.error
        ? String(restoreUserMutation.error)
        : null;

  const modalProps = getUserModalProps(modalAction, selectedUser);

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

              {modalAction && (
                <AlertModal
                  isOpen={isModalOpen}
                  loading={isModalLoading}
                  onClose={handleCloseModal}
                  onConfirm={handleConfirmAction}
                  error={modalError}
                  title={modalProps.title}
                  description={modalProps.description}
                  confirmLabel={modalProps.confirmLabel}
                  cancelLabel='Cancelar'
                  intent={modalProps.intent}
                />
              )}
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
