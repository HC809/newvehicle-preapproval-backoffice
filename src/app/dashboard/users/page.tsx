'use client';

import { useState, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { UserRole } from 'types/User';
import { roleTranslations } from '@/utils/roleTranslations';

function UserContent() {
  const apiClient = useAxios();
  const {
    isLoading,
    isFetching,
    data: users,
    error,
    refetch
  } = useUsers(apiClient);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');

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

  // Filter users locally based on search term and role
  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user) => {
      const matchesSearch = user.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, selectedRole]);

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

          <div className='flex gap-4'>
            <Input
              placeholder='Buscar por nombre...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='max-w-sm'
            />
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                setSelectedRole(value as UserRole | 'all')
              }
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Filtrar por rol' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todos los roles</SelectItem>
                {Object.values(UserRole).map((role) => (
                  <SelectItem key={role} value={role}>
                    {roleTranslations[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <div className='space-y-4'>
              <ErrorAlert error={error?.message || String(error)} />
            </div>
          ) : (
            <>
              <UserListingPage
                users={filteredUsers}
                totalItems={filteredUsers.length}
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
