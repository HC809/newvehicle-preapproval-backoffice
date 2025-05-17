import { Metadata } from 'next';
import SetPasswordForm from '@/features/auth/components/set-password-form';
import Image from 'next/image';
import logo from '../../../../public/images/logo.png';

export const metadata: Metadata = {
  title: 'Establecer Contraseña',
  description: 'Página para establecer nueva contraseña.'
};

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token as string | undefined;

  if (!token) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 p-4 sm:w-[350px]'>
          <div className='flex justify-center'>
            <Image
              src={logo}
              alt='COFISA Logo'
              width={300}
              height={80}
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
          <div className='text-center'>
            <h1 className='text-2xl font-bold text-red-600'>Error</h1>
            <p className='mt-2 text-muted-foreground'>
              Token no válido o expirado
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 p-4 sm:w-[350px]'>
        <div className='flex justify-center'>
          <Image
            src={logo}
            alt='COFISA Logo'
            width={300}
            height={80}
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
        <div className='flex flex-col space-y-2 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Establecer Nueva Contraseña
          </h1>
          <p className='text-sm text-muted-foreground'>
            Por favor, ingresa tu nueva contraseña
          </p>
        </div>
        <SetPasswordForm token={token} />
      </div>
    </div>
  );
}
