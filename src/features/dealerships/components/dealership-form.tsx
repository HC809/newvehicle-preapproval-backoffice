'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { DealershipForm as IDealershipForm } from 'types/Dealerships';
import { useState } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SaveIcon } from 'lucide-react';
import { useDealershipStore } from '@/stores/dealership-store';

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
  contactPerson: z.string().min(2, {
    message: 'El nombre del contacto debe tener al menos 2 caracteres.'
  })
}) satisfies z.ZodType<IDealershipForm>;

type DealershipFormProps = {
  onSubmit: (values: IDealershipForm) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DealershipForm({
  onSubmit,
  open,
  onOpenChange
}: DealershipFormProps) {
  const { dealershipToEdit } = useDealershipStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultValues: z.infer<typeof formSchema> = {
    name: dealershipToEdit?.name ?? '',
    address: dealershipToEdit?.address ?? '',
    phoneNumber: dealershipToEdit?.phoneNumber ?? '',
    email: dealershipToEdit?.email ?? '',
    contactPerson: dealershipToEdit?.contactPerson ?? ''
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    values: defaultValues
  });

  useEffect(() => {
    if (dealershipToEdit) {
      const values = {
        name: dealershipToEdit.name ?? '',
        address: dealershipToEdit.address ?? '',
        phoneNumber: dealershipToEdit.phoneNumber ?? '',
        email: dealershipToEdit.email ?? '',
        contactPerson: dealershipToEdit.contactPerson ?? ''
      };
      form.reset(values);
    }
  }, [dealershipToEdit, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (err) {
      setError(err as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='sm:max-w-[800px]'
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {dealershipToEdit ? 'Editar Concesionaria' : 'Nueva Concesionaria'}
          </DialogTitle>
          <DialogDescription>
            {dealershipToEdit
              ? 'Modifique los datos de la concesionaria en el formulario a continuación.'
              : 'Complete los datos de la nueva concesionaria en el formulario a continuación.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-6'
          >
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ingrese el nombre de la concesionaria'
                        {...field}
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
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ingrese el número de teléfono'
                        {...field}
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
                        placeholder='Ingrese el correo electrónico'
                        type='email'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='contactPerson'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Persona de Contacto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ingrese el nombre de la persona de contacto'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Ingrese la dirección completa'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className='flex justify-end gap-4'>
              <DialogTrigger asChild>
                <Button variant='outline' type='button' disabled={isSubmitting}>
                  Cancelar
                </Button>
              </DialogTrigger>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? (
                  <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <SaveIcon className='mr-2 h-4 w-4' />
                )}
                {isSubmitting
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
