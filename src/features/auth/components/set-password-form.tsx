'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { createAxiosInstance } from '@/lib/axios-instance';

interface SetPasswordFormProps {
  token: string;
}

const formSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
    confirmPassword: z
      .string()
      .min(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
  });

type FormValues = z.infer<typeof formSchema>;

export default function SetPasswordForm({ token }: SetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const apiClient = createAxiosInstance();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post('/auth/set-password', {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });

      if (response.status === 200) {
        setIsSuccess(true);
        toast.success('Contraseña establecida exitosamente');
      }
    } catch (error) {
      setErrorMessage(error as string);
      toast.error('Error al establecer la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className='flex flex-col items-center justify-center space-y-4 text-center'>
        <CheckCircle2 className='h-12 w-12 text-green-500' />
        <h2 className='text-xl font-semibold'>¡Contraseña Establecida!</h2>
        <p className='text-sm text-muted-foreground'>
          Tu contraseña ha sido actualizada exitosamente. Por favor, cierra esta
          ventana y utiliza la aplicación móvil para iniciar sesión.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-4'>
        {errorMessage && (
          <div className='mb-2 text-sm text-red-500'>{errorMessage}</div>
        )}

        <FormField
          control={form.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva Contraseña</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Ingrese su nueva contraseña...'
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Contraseña</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Confirme su nueva contraseña...'
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={isLoading} className='w-full' type='submit'>
          {isLoading ? 'Procesando...' : 'Establecer Contraseña'}
        </Button>
      </form>
    </Form>
  );
}
