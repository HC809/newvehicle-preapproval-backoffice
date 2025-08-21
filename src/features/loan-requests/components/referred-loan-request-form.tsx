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
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SaveIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateLoanRequestByReferral } from '../api/loan-request-service';
import useAxios from '@/hooks/use-axios';
import { toast } from 'sonner';

const formSchema = z.object({
  dni: z
    .string()
    .min(1, { message: 'El DNI del cliente es obligatorio.' })
    .length(13, { message: 'El DNI debe tener 13 dígitos.' })
    .regex(/^[0-9]+$/, { message: 'El DNI solo debe contener dígitos.' }),
  phoneNumber: z
    .string()
    .min(1, { message: 'El número de teléfono es obligatorio.' })
    .regex(/^\d{8}$/, {
      message: 'El número de teléfono debe contener exactamente 8 dígitos.'
    }),
  comment: z
    .string()
    .min(1, {
      message:
        'Por favor ingrese al menos una referencia del vehículo o información del cliente.'
    })
    .min(5, {
      message:
        'Ingrese información más detallada para que podamos identificar el vehículo o al cliente.'
    })
    .refine(
      (value) => {
        // Validar que no sean solo símbolos o números sin contexto
        const hasValidContent = /[a-zA-Z]/.test(value);
        return hasValidContent;
      },
      {
        message:
          'La información ingresada no es válida, describa con palabras lo que conoce del vehículo o del cliente.'
      }
    )
});

type FormValues = z.infer<typeof formSchema>;

type ReferredLoanRequestFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ReferredLoanRequestForm({
  open,
  onOpenChange
}: ReferredLoanRequestFormProps) {
  const apiClient = useAxios();
  const createLoanRequestMutation = useCreateLoanRequestByReferral(apiClient);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dni: '',
      phoneNumber: '',
      comment: ''
    },
    mode: 'onChange'
  });

  const resetForm = useCallback(() => {
    form.reset();
  }, [form]);

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      const result = formSchema.safeParse(values);

      if (!result.success) {
        return;
      }

      createLoanRequestMutation.mutate(result.data, {
        onSuccess: () => {
          resetForm();
          onOpenChange(false);
          toast.success('Solicitud de referido creada', {
            description: 'La solicitud ha sido creada correctamente.'
          });
        },
        onError: (error) => {
          toast.error('Error al crear la solicitud', {
            description: error.message
          });
        }
      });
    },
    [createLoanRequestMutation, resetForm, onOpenChange]
  );

  const isFormLocked = createLoanRequestMutation.isPending;

  const handleClose = useCallback(() => {
    if (isFormLocked) return;
    resetForm();
    createLoanRequestMutation.reset();
    onOpenChange(false);
  }, [resetForm, onOpenChange, createLoanRequestMutation, isFormLocked]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpenState) => {
        if (!newOpenState && isFormLocked) return;
        onOpenChange(newOpenState);
      }}
    >
      <DialogContent
        className='sm:max-w-[600px]'
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
        <DialogHeader className='space-y-2'>
          <DialogTitle className='break-words text-lg md:text-xl'>
            Nueva Solicitud de Referido
          </DialogTitle>
          <DialogDescription className='break-words text-sm md:text-base'>
            Complete los datos del cliente referido para crear una nueva
            solicitud.
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
                name='dni'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI del Cliente</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='Ingrese el DNI del cliente (13 dígitos)'
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='Ingrese el número de teléfono (8 dígitos)'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='comment'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Información del vehículo o del cliente
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='Escriba aquí los detalles que conozca sobre el vehículo o el cliente...'
                        className='min-h-[100px]'
                      />
                    </FormControl>
                    <FormMessage />
                    <p className='text-xs text-muted-foreground'>
                      &quot;Si no conoce el modelo exacto, escriba lo que sepa
                      (ejemplo: &quot;Hyundai blanco 2021&quot;, &quot;Cliente
                      trabaja en banco, llamar después de las 4pm&quot;). El
                      gestor confirmará los datos luego.&quot;
                    </p>
                  </FormItem>
                )}
              />
            </div>

            {createLoanRequestMutation.error && (
              <Alert variant='destructive'>
                <AlertDescription>
                  {String(createLoanRequestMutation.error)}
                </AlertDescription>
              </Alert>
            )}

            <div className='mt-6 flex flex-col justify-end gap-4 sm:flex-row'>
              <Button
                variant='outline'
                type='button'
                disabled={isFormLocked}
                onClick={handleClose}
                className='w-full sm:w-auto'
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={isFormLocked}
                className='w-full sm:w-auto'
              >
                {isFormLocked ? (
                  <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <SaveIcon className='mr-2 h-4 w-4' />
                )}
                {isFormLocked ? 'Guardando...' : 'Crear Solicitud'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
