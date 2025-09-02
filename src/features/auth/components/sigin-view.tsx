'use client';

import { Metadata } from 'next';
import Image from 'next/image';
import UserAuthForm from './user-auth-form';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import AnimatedBackground from '@/components/custom/animated-background';
import logo from '../../../../public/images/logo.png';
import logoDark from '../../../../public/images/logo-dark.png';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Error boundary for the component
  if (error) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <h1 className='mb-4 text-2xl font-bold text-red-600'>
            Error de Carga
          </h1>
          <p className='mb-4 text-gray-600'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
          >
            Recargar Página
          </button>
        </div>
      </div>
    );
  }

  const logoSrc = mounted && resolvedTheme === 'dark' ? logoDark : logo;

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      {/* Mitad Izquierda - Cambiado a azul marino muy oscuro, casi negro */}
      <div className='relative hidden h-full flex-col overflow-hidden p-10 text-white lg:flex'>
        {/* Contenedor para el fondo animado - Note that we're now applying background color in the component */}
        <div className='absolute inset-0 overflow-hidden'>
          <AnimatedBackground theme={resolvedTheme} />
        </div>

        {/* Contenido del lado izquierdo - increasing z-index to ensure visibility */}
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Image
            src={logoDark}
            alt='COFISA Logo'
            width={140}
            height={20}
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>

        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;Seamos positivos y veamos oportunidades donde hay
              dificultades.&rdquo;
            </p>
            <footer className='text-sm'>Roger Valladares</footer>
          </blockquote>
        </div>
      </div>

      {/* Mitad Derecha */}
      <div className='flex h-full items-center p-4 lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <div className='flex justify-center'>
            <Image
              src={logoSrc}
              alt='COFISA Logo'
              width={300}
              height={80}
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Iniciar Sesión
            </h1>
            <p className='text-sm text-muted-foreground'>
              Ingrese sus credenciales para acceder al sistema
            </p>
          </div>
          <UserAuthForm />
        </div>
      </div>
    </div>
  );
}
