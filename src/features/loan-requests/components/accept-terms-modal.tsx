'use client';

import React, { useCallback } from 'react';
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
import { ReloadIcon } from '@radix-ui/react-icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SaveIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SearchableSelect } from '@/components/searchable-select';
import { useCities } from '@/features/cities/api/city-service';
import useAxios from '@/hooks/use-axios';

const formSchema = z.object({
  phoneNumber: z.string().length(8, {
    message: 'El teléfono debe tener 8 dígitos.'
  }),
  city: z.string().min(1, {
    message: 'Debe seleccionar una ciudad.'
  }),
  address: z.string().min(5, {
    message: 'La dirección debe tener al menos 5 caracteres.'
  })
});

type FormValues = z.infer<typeof formSchema>;

type AcceptTermsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
  client?: {
    city?: string | null;
    residentialAddress?: string | null;
    phoneNumber?: string | null;
  } | null;
};

export function AcceptTermsModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  client
}: AcceptTermsModalProps) {
  const apiClient = useAxios();
  const {
    data: cities,
    isLoading: isCitiesLoading,
    isFetching: isCitiesFetching,
    isSuccess: isCitiesSuccess
  } = useCities(apiClient);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: client?.phoneNumber || '',
      city: client?.city
        ? client.city
            .trim()
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        : '',
      address: client?.residentialAddress || ''
    },
    mode: 'onChange'
  });

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    form.reset();
    onClose();
  }, [form, onClose, isSubmitting]);

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      try {
        await onSubmit(values);
        form.reset();
      } catch (error) {
        // Error is handled by the parent component
      }
    },
    [onSubmit, form]
  );

  const isLoading = isCitiesLoading || isCitiesFetching || !isCitiesSuccess;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(newOpenState) => {
        if (!newOpenState && isSubmitting) return;
        handleClose();
      }}
    >
      <DialogContent
        className='sm:max-w-[725px]'
        onEscapeKeyDown={(event) => {
          if (isSubmitting) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (isSubmitting) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className='text-lg md:text-xl'>
            Aceptar Términos del Préstamo
          </DialogTitle>
          <DialogDescription className='text-sm md:text-base'>
            Complete los datos del cliente para aceptar los términos del
            préstamo.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
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
                  name='phoneNumber'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Ingrese el número de teléfono'
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={cities.map((city: string) => ({
                            value: city,
                            label: city
                          }))}
                          placeholder='Seleccione una ciudad'
                          searchPlaceholder='Buscar ciudad...'
                          value={field.value || ''}
                          onSelect={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
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
                        <Input
                          {...field}
                          placeholder='Ingrese la dirección completa'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className='flex justify-end space-x-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  disabled={isSubmitting || !form.formState.isValid}
                >
                  {isSubmitting ? (
                    <>
                      <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <SaveIcon className='mr-2 h-4 w-4' />
                      Aceptar Términos
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
