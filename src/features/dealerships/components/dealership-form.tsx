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
import { SaveIcon } from 'lucide-react';
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

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.'
  }),
  address: z.string().min(5, {
    message: 'La dirección debe tener al menos 5 caracteres.'
  }),
  phoneNumber: z.string().length(8, {
    message: 'El teléfono debe tener 8 dígitos.'
  }),
  email: z.string().email({
    message: 'Por favor ingrese un correo electrónico válido.'
  }),
  isActive: z.boolean()
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: dealershipToEdit?.name ?? '',
      address: dealershipToEdit?.address ?? '',
      phoneNumber: dealershipToEdit?.phoneNumber ?? '',
      email: dealershipToEdit?.email ?? '',
      isActive: true
    },
    mode: 'onChange' // Validación en tiempo real
  });

  const resetForm = useCallback(() => {
    form.reset({
      name: '',
      address: '',
      phoneNumber: '',
      email: '',
      isActive: true
    });
    setDealershipToEdit(null);
  }, [form, setDealershipToEdit]);

  const handleSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      const handleFormCleanup = () => {
        resetForm();
        onOpenChange(false);
      };

      dealershipToEdit
        ? updateDealershipMutation.mutate(
            {
              ...values,
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
        : createDealershipMutation.mutate(values, {
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

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  useEffect(() => {
    if (dealershipToEdit) {
      form.reset({
        name: dealershipToEdit.name,
        address: dealershipToEdit.address || '',
        phoneNumber: dealershipToEdit.phoneNumber || '',
        email: dealershipToEdit.email || '',
        isActive: dealershipToEdit.isActive
      });
    }
  }, [dealershipToEdit, form]);

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
                          desactivados y no podrán iniciar sesión en el sistema.
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
      </DialogContent>
    </Dialog>
  );
}
