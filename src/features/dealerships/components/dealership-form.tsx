'use client';

import React, { useEffect, useCallback } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SaveIcon, Loader2 } from 'lucide-react';
import { useDealershipStore } from '@/stores/dealership-store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DealershipForm as IDealershipForm } from 'types/Dealerships';
import {
  useCreateDealership,
  useUpdateDealership
} from '../api/dealership-service';
import useAxios from '@/hooks/use-axios';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useUsers } from '@/features/users/api/user-service';
import { UserRole } from 'types/User';

// Update the schema to properly validate and show custom error messages
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.'
  }),
  address: z
    .string()
    .min(5, {
      message: 'La dirección debe tener al menos 5 caracteres.'
    })
    .optional()
    .or(z.literal('')),
  phoneNumber: z
    .string()
    .length(8, {
      message: 'El teléfono debe tener 8 dígitos.'
    })
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email({
      message: 'Por favor ingrese un correo electrónico válido.'
    })
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
  managerId: z.string().transform((val) => (val === 'null' ? null : val))
}) satisfies z.ZodType<IDealershipForm>;

type DealershipFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DealershipForm({
  open,
  onOpenChange
}: DealershipFormProps) {
  const apiClient = useAxios();
  const { dealershipToEdit, setDealershipToEdit } = useDealershipStore();
  const createDealershipMutation = useCreateDealership(apiClient);
  const updateDealershipMutation = useUpdateDealership(apiClient);

  const {
    data: users = [],
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
    isSuccess: isUsersSuccess
  } = useUsers(apiClient, open); // Only fetch when dialog is open

  const businessDevelopmentUsers = React.useMemo(
    () =>
      users.filter(
        (u) =>
          u.role === UserRole.BusinessDevelopment_User &&
          u.isActive &&
          !u.isDeleted
      ),
    [users]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      phoneNumber: '',
      email: '',
      isActive: true,
      managerId: 'null'
    },
    mode: 'onChange'
  });

  const resetForm = useCallback(() => {
    form.reset({
      name: '',
      address: '',
      phoneNumber: '',
      email: '',
      isActive: true,
      managerId: 'null'
    });
    setDealershipToEdit(null);
  }, [form, setDealershipToEdit]);

  const handleSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      // Ensure managerId is properly processed
      const processedValues = {
        ...values,
        managerId: values.managerId === 'null' ? null : values.managerId
      };

      const handleFormCleanup = () => {
        resetForm();
        onOpenChange(false);
      };

      dealershipToEdit
        ? updateDealershipMutation.mutate(
            {
              ...processedValues,
              id: dealershipToEdit.id,
              isDeleted: dealershipToEdit.isDeleted
            },
            {
              onSuccess: () => {
                handleFormCleanup();
                toast.success('Concesionaria actualizada', {
                  description: `La concesionaria "${values.name}" ha sido actualizada correctamente.`
                });
              }
            }
          )
        : createDealershipMutation.mutate(processedValues, {
            onSuccess: () => {
              handleFormCleanup();
              toast.success('Concesionaria creada', {
                description: `La concesionaria "${values.name}" ha sido creado correctamente.`
              });
            }
          });
    },
    [
      createDealershipMutation,
      updateDealershipMutation,
      dealershipToEdit,
      resetForm,
      onOpenChange
    ]
  );

  const isFormLocked =
    createDealershipMutation.isPending || updateDealershipMutation.isPending;

  const handleClose = useCallback(() => {
    if (isFormLocked) return; // Prevent closing if mutations are pending
    resetForm();
    onOpenChange(false);
  }, [resetForm, onOpenChange, isFormLocked]);

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  // Update form when users are loaded and dealershipToEdit exists
  useEffect(() => {
    if (open && dealershipToEdit) {
      form.reset(
        {
          name: dealershipToEdit.name,
          address: dealershipToEdit.address || '',
          phoneNumber: dealershipToEdit.phoneNumber || '',
          email: dealershipToEdit.email || '',
          isActive: dealershipToEdit.isActive,
          managerId: dealershipToEdit.managerId || 'null'
        },
        {
          keepDefaultValues: true
        }
      );
    } else if (open && !dealershipToEdit) {
      // For new dealership
      form.reset({
        name: '',
        address: '',
        phoneNumber: '',
        email: '',
        isActive: true,
        managerId: 'null'
      });
    }
  }, [dealershipToEdit, form, open]);

  const isLoadingUsers = isUsersLoading || isUsersFetching || !isUsersSuccess;

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
            {dealershipToEdit ? 'Editar Concesionaria' : 'Nueva Concesionaria'}
          </DialogTitle>
          <DialogDescription className='text-sm md:text-base'>
            {dealershipToEdit
              ? 'Modifique los datos de la concesionaria en el formulario a continuación.'
              : 'Complete los datos de la nueva concesionaria en el formulario a continuación.'}
          </DialogDescription>
        </DialogHeader>

        {isLoadingUsers ? (
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
                          placeholder='Ingrese el nombre de la concesionaria'
                          autoFocus
                        />
                      </FormControl>
                      {form.formState.errors.name && (
                        <FormMessage>
                          {form.formState.errors.name.message}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='phoneNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Ingrese el número de teléfono'
                        />
                      </FormControl>
                      {form.formState.errors.phoneNumber && (
                        <FormMessage>
                          {form.formState.errors.phoneNumber.message}
                        </FormMessage>
                      )}
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
                          placeholder='Ingrese el correo electrónico'
                          type='email'
                        />
                      </FormControl>
                      {form.formState.errors.email && (
                        <FormMessage>
                          {form.formState.errors.email.message}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='managerId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oficial de Negocio</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || 'null'}
                        defaultValue={field.value || 'null'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Seleccione un oficial de negocio'>
                              {field.value && field.value !== 'null'
                                ? businessDevelopmentUsers.find(
                                    (u) => u.id === field.value
                                  )?.name || 'Cargando...'
                                : 'Sin asignar'}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='null'>Sin asignar</SelectItem>
                          {businessDevelopmentUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Seleccione el oficial de negocio que gestionará esta
                        concesionaria.
                      </FormDescription>
                      {form.formState.errors.managerId && (
                        <FormMessage>
                          {form.formState.errors.managerId.message}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder='Ingrese la dirección completa'
                          className='resize-none'
                        />
                      </FormControl>
                      {form.formState.errors.address && (
                        <FormMessage>
                          {form.formState.errors.address.message}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                {dealershipToEdit && (
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
                          <FormLabel>Concesionaria Activa</FormLabel>
                          <FormDescription>
                            Al desactivar una concesionaria, los usuarios
                            asesores/vendedores asociados a ella quedarán
                            desactivados y no podrán iniciar sesión en el
                            sistema.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
              </div>

              {(createDealershipMutation.error ||
                updateDealershipMutation.error) && (
                <Alert variant='destructive'>
                  <AlertDescription>
                    {dealershipToEdit
                      ? String(updateDealershipMutation.error)
                      : String(createDealershipMutation.error)}
                  </AlertDescription>
                </Alert>
              )}

              <div className='flex justify-end gap-4'>
                <Button
                  variant='outline'
                  type='button'
                  disabled={
                    createDealershipMutation.isPending ||
                    updateDealershipMutation.isPending
                  }
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  disabled={createDealershipMutation.isPending}
                >
                  {createDealershipMutation.isPending ||
                  updateDealershipMutation.isPending ? (
                    <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <SaveIcon className='mr-2 h-4 w-4' />
                  )}
                  {createDealershipMutation.isPending
                    ? 'Guardando...'
                    : `${dealershipToEdit ? 'Actualizar' : 'Crear'} Concesionaria`}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
