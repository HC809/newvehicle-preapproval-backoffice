'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10'>
            <AlertTriangle className='h-8 w-8 text-destructive' />
          </div>
          <CardTitle className='text-2xl'>Página No Encontrada</CardTitle>
          <CardDescription>
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='text-center text-sm text-muted-foreground'>
            <p>Verifica la URL o navega a una página diferente.</p>
          </div>

          <div className='flex flex-col space-y-2'>
            <Button onClick={() => router.back()} variant='default'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Volver Atrás
            </Button>

            <Button onClick={() => router.push('/dashboard')} variant='outline'>
              <Home className='mr-2 h-4 w-4' />
              Ir al Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
