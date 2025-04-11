'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import { authenticate } from '../actions/auth-actions';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Ingrese un nombre de usuario válido' }),
  password: z
    .string()
    .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Agregamos un useEffect para limpiar los estados cuando el componente se desmonte
  useEffect(() => {
    // Esta función se ejecuta cuando el componente se desmonta
    return () => {
      setLoading(false);
      setErrorMessage(null);
    };
  }, []);

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit: SubmitHandler<UserFormValue> = async (
    credentials: UserFormValue
  ) => {
    // Creamos un flag para saber si el componente está montado
    let isMounted = true;
    setLoading(true);

    try {
      const authResponse = await authenticate(
        credentials.username,
        credentials.password
      );

      // Verificamos si el componente sigue montado antes de actualizar estados
      if (!isMounted) return;

      if (!authResponse.ok) {
        toast.error('¡Error al iniciar sesión!');
        setErrorMessage(authResponse.message);
        setLoading(false);
        return;
      }

      toast.success('¡Inicio de sesión exitoso!');
      router.push('/dashboard');
    } catch (error) {
      // Verificamos si el componente sigue montado antes de actualizar estados
      if (isMounted) {
        setErrorMessage('Error inesperado durante la autenticación');
        setLoading(false);
      }
    }

    // Función de cleanup para el manejador de submit
    return () => {
      isMounted = false;
    };
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-2'>
        {errorMessage && (
          <div className='mb-2 text-sm text-red-500'>{errorMessage}</div>
        )}

        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuario</FormLabel>
              <FormControl>
                <Input
                  type='text'
                  placeholder='Ingrese su nombre de usuario...'
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Ingrese su contraseña...'
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={loading} className='ml-auto w-full' type='submit'>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>
    </Form>
  );
}
