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
import { ReloadIcon } from '@radix-ui/react-icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SaveIcon } from 'lucide-react';
import { useVehicleTypeStore } from '@/stores/vehicle-type-store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { VehicleTypeForm as IVehicleTypeForm } from 'types/VehicleTypes';
import {
  useCreateVehicleType,
  useUpdateVehicleType
} from '../api/vehicle-type-service';
import useAxios from '@/hooks/use-axios';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { InputNumber } from '@/components/ui/input-number';

// Update the schema to properly validate and show custom error messages
const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.'
  }),
  maxLoanTermMonths: z
    .number()
    .min(1, {
      message: 'El plazo máximo debe ser al menos 1 mes.'
    })
    .max(240, {
      message: 'El plazo máximo no puede exceder 240 meses (20 años).'
    }),
  isActive: z.boolean()
}) satisfies z.ZodType<IVehicleTypeForm>;

type VehicleTypeFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function VehicleTypeForm({
  open,
  onOpenChange
}: VehicleTypeFormProps) {
  const apiClient = useAxios();
  const { vehicleTypeToEdit, setVehicleTypeToEdit } = useVehicleTypeStore();
  const createVehicleTypeMutation = useCreateVehicleType(apiClient);
  const updateVehicleTypeMutation = useUpdateVehicleType(apiClient);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      maxLoanTermMonths: 84,
      isActive: true
    },
    mode: 'onChange'
  });

  const resetForm = useCallback(() => {
    form.reset({
      name: '',
      maxLoanTermMonths: 84,
      isActive: true
    });
    setVehicleTypeToEdit(null);
  }, [form, setVehicleTypeToEdit]);

  const handleSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      const handleFormCleanup = () => {
        resetForm();
        onOpenChange(false);
      };

      vehicleTypeToEdit
        ? updateVehicleTypeMutation.mutate(
            {
              ...values,
              id: vehicleTypeToEdit.id
            },
            {
              onSuccess: () => {
                handleFormCleanup();
                toast.success('Tipo de vehículo actualizado', {
                  description: `El tipo de vehículo "${values.name}" ha sido actualizado correctamente.`
                });
              }
            }
          )
        : createVehicleTypeMutation.mutate(values, {
            onSuccess: () => {
              handleFormCleanup();
              toast.success('Tipo de vehículo creado', {
                description: `El tipo de vehículo "${values.name}" ha sido creado correctamente.`
              });
            }
          });
    },
    [
      createVehicleTypeMutation,
      updateVehicleTypeMutation,
      vehicleTypeToEdit,
      resetForm,
      onOpenChange
    ]
  );

  const isFormLocked =
    createVehicleTypeMutation.isPending || updateVehicleTypeMutation.isPending;

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

  // Update form when vehicleTypeToEdit exists
  useEffect(() => {
    if (open && vehicleTypeToEdit) {
      form.reset(
        {
          name: vehicleTypeToEdit.name,
          maxLoanTermMonths: vehicleTypeToEdit.maxLoanTermMonths,
          isActive: vehicleTypeToEdit.isActive
        },
        {
          keepDefaultValues: true
        }
      );
    } else if (open && !vehicleTypeToEdit) {
      // For new vehicle type
      form.reset({
        name: '',
        maxLoanTermMonths: 1,
        isActive: true
      });
    }
  }, [vehicleTypeToEdit, form, open]);

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
            {vehicleTypeToEdit
              ? 'Editar Tipo de Vehículo'
              : 'Nuevo Tipo de Vehículo'}
          </DialogTitle>
          <DialogDescription className='text-sm md:text-base'>
            {vehicleTypeToEdit
              ? 'Modifique los datos del tipo de vehículo en el formulario a continuación.'
              : 'Complete los datos del nuevo tipo de vehículo en el formulario a continuación.'}
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
                        placeholder='Ingrese el nombre del tipo de vehículo'
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
                name='maxLoanTermMonths'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plazo máximo de préstamo (meses)</FormLabel>
                    <FormControl>
                      <InputNumber
                        {...field}
                        placeholder='Ingrese el plazo máximo en meses'
                        min={1}
                        max={240}
                      />
                    </FormControl>
                    <FormDescription>
                      Plazo máximo permitido para préstamos de este tipo de
                      vehículo (en meses).
                    </FormDescription>
                    {form.formState.errors.maxLoanTermMonths && (
                      <FormMessage>
                        {form.formState.errors.maxLoanTermMonths.message}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />

              {vehicleTypeToEdit && (
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
                        <FormLabel>Tipo de Vehículo Activo</FormLabel>
                        <FormDescription>
                          Al desactivar un tipo de vehículo, no estará
                          disponible para nuevos préstamos.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </div>

            {(createVehicleTypeMutation.error ||
              updateVehicleTypeMutation.error) && (
              <Alert variant='destructive'>
                <AlertDescription>
                  {vehicleTypeToEdit
                    ? String(updateVehicleTypeMutation.error)
                    : String(createVehicleTypeMutation.error)}
                </AlertDescription>
              </Alert>
            )}

            <div className='flex justify-end gap-4'>
              <Button
                variant='outline'
                type='button'
                disabled={
                  createVehicleTypeMutation.isPending ||
                  updateVehicleTypeMutation.isPending
                }
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={createVehicleTypeMutation.isPending}
              >
                {createVehicleTypeMutation.isPending ||
                updateVehicleTypeMutation.isPending ? (
                  <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <SaveIcon className='mr-2 h-4 w-4' />
                )}
                {createVehicleTypeMutation.isPending
                  ? 'Guardando...'
                  : `${vehicleTypeToEdit ? 'Actualizar' : 'Crear'} Tipo de Vehículo`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
