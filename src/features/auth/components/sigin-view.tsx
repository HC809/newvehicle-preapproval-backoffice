'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';
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

export default function SignInViewPage({ stars }: { stars: number }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = mounted && resolvedTheme === 'dark' ? logoDark : logo;

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/examples/authentication'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute right-4 top-4 hidden md:right-8 md:top-8'
        )}
      >
        Login
      </Link>

      {/* Mitad Izquierda - Cambiado a azul marino muy oscuro, casi negro */}
      <div className='relative hidden h-full flex-col overflow-hidden bg-[#000000] p-10 text-white lg:flex'>
        {/* Contenedor para el fondo animado */}
        <div className='absolute inset-0 overflow-hidden'>
          <AnimatedBackground />
        </div>

        {/* Contenido del lado izquierdo */}
        <div className='relative z-30 flex items-center text-lg font-medium'>
          <Image
            src={logoDark}
            alt='COFISA Logo'
            width={140}
            height={20}
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>

        <div className='relative z-30 mt-auto'>
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
