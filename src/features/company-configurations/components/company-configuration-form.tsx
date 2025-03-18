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
import { ReloadIcon } from '@radix-ui/react-icons';
import { SaveIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CompanyConfigurationForm as ICompanyConfigurationForm } from 'types/CompanyConfigurations';
import { useCreateCompanyConfiguration } from '../api/company-configuration-service';
import useAxios from '@/hooks/use-axios';
import { toast } from 'sonner';
import { NumberInput } from '@/components/number-input';

// Schema for form validation
const formSchema = z.object({
  dollarExchangeRate: z.number().min(1, {
    message: 'La tasa de cambio debe ser mayor a 0.'
  }),
  interestRate: z
    .number()
    .min(0.1, {
      message: 'La tasa de interés debe ser mayor a 0.'
    })
    .max(100, {
      message: 'La tasa de interés no puede exceder 100%.'
    }),
  monthlyGpsFee: z.number().min(0, {
    message: 'La tarifa mensual de GPS no puede ser negativa.'
  }),
  closingCosts: z.number().min(0, {
    message: 'Los costos de cierre no pueden ser negativos.'
  })
}) satisfies z.ZodType<ICompanyConfigurationForm>;

type CompanyConfigurationFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentConfiguration: ICompanyConfigurationForm | null;
};

export default function CompanyConfigurationForm({
  open,
  onOpenChange,
  currentConfiguration
}: CompanyConfigurationFormProps) {
  const apiClient = useAxios();
  const createCompanyConfigurationMutation =
    useCreateCompanyConfiguration(apiClient);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dollarExchangeRate: currentConfiguration?.dollarExchangeRate || 1,
      interestRate: currentConfiguration?.interestRate || 0.1,
      monthlyGpsFee: currentConfiguration?.monthlyGpsFee || 0,
      closingCosts: currentConfiguration?.closingCosts || 0
    },
    mode: 'onChange'
  });

  const resetForm = useCallback(() => {
    form.reset({
      dollarExchangeRate: currentConfiguration?.dollarExchangeRate || 1,
      interestRate: currentConfiguration?.interestRate || 0.1,
      monthlyGpsFee: currentConfiguration?.monthlyGpsFee || 0,
      closingCosts: currentConfiguration?.closingCosts || 0
    });
  }, [form, currentConfiguration]);

  const handleSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      const handleFormCleanup = () => {
        resetForm();
        onOpenChange(false);
      };

      createCompanyConfigurationMutation.mutate(values, {
        onSuccess: () => {
          handleFormCleanup();
          toast.success('Configuración actualizada', {
            description: 'Las tasas han sido actualizadas correctamente.'
          });
        }
      });
    },
    [createCompanyConfigurationMutation, resetForm, onOpenChange]
  );

  const isFormLocked = createCompanyConfigurationMutation.isPending;

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

  // Update form when currentConfiguration changes
  useEffect(() => {
    if (open && currentConfiguration) {
      form.reset(
        {
          dollarExchangeRate: currentConfiguration.dollarExchangeRate,
          interestRate: currentConfiguration.interestRate,
          monthlyGpsFee: currentConfiguration.monthlyGpsFee,
          closingCosts: currentConfiguration.closingCosts
        },
        {
          keepDefaultValues: true
        }
      );
    }
  }, [currentConfiguration, form, open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpenState) => {
        if (!newOpenState && isFormLocked) return; // Prevent closing if mutations are pending
        onOpenChange(newOpenState);
      }}
    >
      <DialogContent
        className='sm:max-w-[500px]'
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
            Actualizar Tasas
          </DialogTitle>
          <DialogDescription className='text-sm md:text-base'>
            Actualice la tasa de cambio del dólar y la tasa de interés para
            préstamos de vehículos.
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
                name='interestRate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tasa de Interés (%)</FormLabel>
                    <FormControl>
                      <NumberInput
                        placeholder='Ingrese la tasa de interés'
                        min={0.1}
                        max={100}
                        step={0.1}
                        decimalScale={2}
                        fixedDecimalScale={true}
                        suffix='%'
                        value={field.value}
                        onValueChange={(value: number | undefined) => {
                          field.onChange(value === undefined ? 0.1 : value);
                        }}
                        autoFocus
                      />
                    </FormControl>
                    <FormDescription>
                      Tasa de interés anual para préstamos de vehículos (en
                      porcentaje).
                    </FormDescription>
                    {form.formState.errors.interestRate && (
                      <FormMessage>
                        {form.formState.errors.interestRate.message}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='closingCosts'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gastos de Cierre</FormLabel>
                    <FormControl>
                      <NumberInput
                        placeholder='Ingrese los gastos de cierre'
                        min={0}
                        step={1}
                        decimalScale={2}
                        fixedDecimalScale={true}
                        value={field.value}
                        onValueChange={(value: number | undefined) => {
                          field.onChange(value === undefined ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Costos de cierre en Lempiras.
                    </FormDescription>
                    {form.formState.errors.closingCosts && (
                      <FormMessage>
                        {form.formState.errors.closingCosts.message}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='monthlyGpsFee'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarifa Mensual GPS</FormLabel>
                    <FormControl>
                      <NumberInput
                        placeholder='Ingrese la tarifa mensual de GPS'
                        min={0}
                        step={1}
                        decimalScale={2}
                        fixedDecimalScale={true}
                        value={field.value}
                        onValueChange={(value: number | undefined) => {
                          field.onChange(value === undefined ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Tarifa mensual del servicio GPS en Lempiras.
                    </FormDescription>
                    {form.formState.errors.monthlyGpsFee && (
                      <FormMessage>
                        {form.formState.errors.monthlyGpsFee.message}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='dollarExchangeRate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tasa de Cambio del Dólar</FormLabel>
                    <FormControl>
                      <NumberInput
                        placeholder='Ingrese la tasa de cambio'
                        min={1}
                        step={0.01}
                        decimalScale={2}
                        fixedDecimalScale={true}
                        value={field.value}
                        onValueChange={(value: number | undefined) => {
                          field.onChange(value === undefined ? 1 : value);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Tasa de cambio actual del dólar a moneda local.
                    </FormDescription>
                    {form.formState.errors.dollarExchangeRate && (
                      <FormMessage>
                        {form.formState.errors.dollarExchangeRate.message}
                      </FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <div className='flex justify-end space-x-2'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isFormLocked}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={isFormLocked || !form.formState.isValid}
              >
                {isFormLocked ? (
                  <>
                    <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                    Guardando...
                  </>
                ) : (
                  <>
                    <SaveIcon className='mr-2 h-4 w-4' />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
