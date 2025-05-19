'use client';

import React, { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SaveIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserRole } from 'types/User';
import { useCreateUser, useUpdateUser } from '../api/user-service';
import useAxios from '@/hooks/use-axios';
import { useUserStore } from '@/stores/user-store';
import { useDealerships } from '@/features/dealerships/api/dealership-service';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { translateRole } from '@/utils/translateRole';

const DEFAULT_DEALERSHIP_NAME = 'COFISA';

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: 'El nombre debe tener al menos 2 caracteres.'
    }),
    email: z.string().email({
      message: 'Por favor ingrese un correo electrónico válido.'
    }),
    dealershipId: z.string().nullable(),
    role: z.nativeEnum(UserRole),
    isActive: z.boolean(),
    hasAutomaticApproval: z.boolean()
  })
  .refine(
    (data) => {
      if (data.role === UserRole.Dealership_Admin) {
        return data.dealershipId !== null && data.dealershipId !== '';
      }
      return true;
    },
    {
      message:
        'Debe seleccionar una concesionaria para el rol Administrador de Concesionaria',
      path: ['dealershipId']
    }
  );

type UserFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function UserForm({ open, onOpenChange }: UserFormProps) {
  const apiClient = useAxios();
  const { userToEdit, setUserToEdit } = useUserStore();
  const createUserMutation = useCreateUser(apiClient);
  const updateUserMutation = useUpdateUser(apiClient);
  const {
    data: dealerships = [],
    isLoading: isDealershipsLoading,
    isFetching: isDealershipsFetching,
    isSuccess: isDealershipsSuccess
  } = useDealerships(apiClient, open);

  const filteredDealerships = React.useMemo(
    () => dealerships.filter((d) => d.name !== DEFAULT_DEALERSHIP_NAME),
    [dealerships]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      role: UserRole.BusinessDevelopment_User,
      dealershipId: null,
      isActive: true,
      hasAutomaticApproval: false
    },
    mode: 'onChange'
  });

  const selectedRole = form.watch('role');

  const resetForm = useCallback(() => {
    form.reset();
    setUserToEdit(null);
  }, [form, setUserToEdit]);

  const handleSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      const handleFormCleanup = () => {
        resetForm();
        onOpenChange(false);
      };

      if (userToEdit) {
        updateUserMutation.mutate(
          {
            ...values,
            id: userToEdit.id,
            isDeleted: userToEdit.isDeleted
          },
          {
            onSuccess: () => {
              handleFormCleanup();
              toast.success('Usuario actualizado', {
                description: `El usuario "${values.name}" ha sido actualizado correctamente.`
              });
            }
          }
        );
      } else {
        createUserMutation.mutate(values, {
          onSuccess: () => {
            handleFormCleanup();
            toast.success('Usuario creado', {
              description: `El usuario "${values.name}" ha sido creado correctamente.`
            });
          }
        });
      }
    },
    [
      createUserMutation,
      updateUserMutation,
      userToEdit,
      resetForm,
      onOpenChange
    ]
  );

  const isFormLocked =
    createUserMutation.isPending || updateUserMutation.isPending;

  const handleClose = useCallback(() => {
    if (isFormLocked) return; // Prevent closing if mutations are pending
    resetForm();
    createUserMutation.reset();
    updateUserMutation.reset();
    onOpenChange(false);
  }, [
    resetForm,
    onOpenChange,
    createUserMutation,
    updateUserMutation,
    isFormLocked
  ]);

  useEffect(() => {
    if (open) {
      if (!userToEdit) {
        // Si es nuevo usuario, resetear con valores por defecto
        form.reset({
          name: '',
          email: '',
          role: UserRole.BusinessDevelopment_User,
          dealershipId: null,
          isActive: true,
          hasAutomaticApproval: false
        });
      } else {
        // Si estamos editando, establecer los valores del usuario inmediatamente
        form.reset(
          {
            name: userToEdit.name,
            email: userToEdit.email,
            dealershipId: userToEdit.dealershipId || null,
            role: userToEdit.role,
            isActive: userToEdit.isActive,
            hasAutomaticApproval: userToEdit.hasAutomaticApproval
          },
          {
            keepDefaultValues: true
          }
        );
      }
    }
  }, [open, userToEdit, form]);

  // Efecto para manejar el cambio de rol
  useEffect(() => {
    const currentDealershipId = form.getValues('dealershipId');
    if (selectedRole !== UserRole.Dealership_Admin) {
      if (currentDealershipId !== null) {
        form.setValue('dealershipId', null, { shouldValidate: true });
      }
    } else if (currentDealershipId === null) {
      form.setValue('dealershipId', '', { shouldValidate: true });
    }
  }, [selectedRole, form]);

  const isLoadingDealerships =
    isDealershipsLoading || isDealershipsFetching || !isDealershipsSuccess;

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpenState) => {
        if (!newOpenState && isFormLocked) return; // Prevent closing if mutations are pending
        onOpenChange(newOpenState);
      }}
    >
      <DialogContent
        className='sm:max-w-[725px]'
        onEscapeKeyDown={(event) => {
          if (isFormLocked) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (isFormLocked) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className='text-lg md:text-xl'>
            {userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
          </DialogTitle>
          <DialogDescription className='text-sm md:text-base'>
            {userToEdit
              ? 'Modifique los datos del usuario en el formulario a continuación.'
              : 'Complete los datos del nuevo usuario en el formulario a continuación.'}
          </DialogDescription>
        </DialogHeader>

        {isLoadingDealerships ? (
          <div className='flex h-40 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-4 md:space-y-6'
            >
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Ingrese el nombre del usuario'
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type='email'
                          placeholder='Ingrese el correo electrónico'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='role'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value} // Agregamos value explícitamente
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Seleccione un rol' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(translateRole).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedRole === UserRole.Dealership_Admin && (
                  <FormField
                    control={form.control}
                    name='dealershipId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Concesionaria</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                          defaultValue={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Seleccione una concesionaria'>
                                {filteredDealerships.find(
                                  (d) => d.id === field.value
                                )?.name || 'Seleccione una concesionaria'}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredDealerships.map((dealership) => (
                              <SelectItem
                                key={dealership.id}
                                value={dealership.id}
                              >
                                {dealership.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {selectedRole === UserRole.BusinessDevelopment_User && (
                  <FormField
                    control={form.control}
                    name='hasAutomaticApproval'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel>Aprobación Automática</FormLabel>
                          <FormDescription>
                            Al activar esta opción, el usuario tendrá aprobación
                            automática de solicitudes
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                {userToEdit && (
                  <FormField
                    control={form.control}
                    name='isActive'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel>Usuario Activo</FormLabel>
                          <FormDescription>
                            Al desactivar un usuario, este no podrá acceder al
                            sistema
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {(createUserMutation.error || updateUserMutation.error) && (
                <Alert variant='destructive'>
                  <AlertDescription>
                    {userToEdit
                      ? String(updateUserMutation.error)
                      : String(createUserMutation.error)}
                  </AlertDescription>
                </Alert>
              )}

              <div className='flex justify-end gap-4'>
                <Button
                  variant='outline'
                  type='button'
                  disabled={
                    createUserMutation.isPending || updateUserMutation.isPending
                  }
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  disabled={
                    createUserMutation.isPending || updateUserMutation.isPending
                  }
                >
                  {createUserMutation.isPending ||
                  updateUserMutation.isPending ? (
                    <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <SaveIcon className='mr-2 h-4 w-4' />
                  )}
                  {createUserMutation.isPending || updateUserMutation.isPending
                    ? 'Guardando...'
                    : `${userToEdit ? 'Actualizar' : 'Crear'} Usuario`}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
