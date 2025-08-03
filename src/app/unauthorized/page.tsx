'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { AlertTriangle, Home, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10'>
            <AlertTriangle className='h-8 w-8 text-destructive' />
          </div>
          <CardTitle className='text-2xl'>Acceso No Autorizado</CardTitle>
          <CardDescription>
            No tienes permisos para acceder a esta página con tu rol actual.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='text-center text-sm text-muted-foreground'>
            <p>
              Si crees que esto es un error, contacta al administrador del
              sistema.
            </p>
          </div>

          <div className='flex flex-col space-y-2'>
            <Button asChild>
              <Link href='/dashboard'>
                <Home className='mr-2 h-4 w-4' />
                Ir al Dashboard
              </Link>
            </Button>

            <Button variant='outline' onClick={() => signOut()}>
              <LogOut className='mr-2 h-4 w-4' />
              Cerrar Sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
