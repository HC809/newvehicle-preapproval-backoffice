'use client';

import React, { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, MapPin, FileText } from 'lucide-react';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import useAxios from '@/hooks/use-axios';
import { useClientDetail } from '@/features/clients/api/client-service';
import { useClientStore } from '@/stores/client-store';

export default function ClientDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const apiClient = useAxios();
  const { selectedClient } = useClientStore();

  // Fetch client details from API
  const {
    data: client,
    isLoading,
    isError,
    error: fetchError
  } = useClientDetail(apiClient, id as string);

  // Use the client from the store as a fallback while loading
  const displayClient = useMemo(
    () => client || selectedClient,
    [client, selectedClient]
  );

  const handleBack = () => {
    router.back();
  };

  // Botón para volver a la lista de clientes
  const handleGoToList = () => {
    router.push('/dashboard/clients');
  };

  // Función para determinar el color del badge según la puntuación de riesgo
  const getRiskScoreColor = (score: number) => {
    if (score >= 700)
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (score >= 500)
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  // Función para determinar el texto del nivel de riesgo
  const getRiskLevelText = (score: number) => {
    if (score >= 700) return 'Bajo';
    if (score >= 500) return 'Medio';
    return 'Alto';
  };

  // Loading state - show skeleton if no selectedClient is available
  if (isLoading && !displayClient) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button variant='outline' size='icon' onClick={handleBack}>
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <Heading
                title='Detalle de Cliente'
                description='Cargando información...'
              />
            </div>
          </div>

          <Separator />

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <div className='space-y-6'>
              <Skeleton className='h-[300px] w-full rounded-lg' />
            </div>
            <div className='space-y-6'>
              <Skeleton className='h-[200px] w-full rounded-lg' />
              <Skeleton className='h-[150px] w-full rounded-lg' />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Error state
  if (isError && !displayClient) {
    const errorMessage =
      fetchError?.message || 'No se pudo cargar la información del cliente';

    return (
      <PageContainer>
        <div className='flex flex-1 flex-col space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button variant='outline' size='icon' onClick={handleBack}>
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <Heading
                title='Detalle de Cliente'
                description='Error al cargar la información'
              />
            </div>
          </div>

          <Separator />

          <Alert variant='destructive'>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          <div className='flex justify-center'>
            <Button onClick={handleGoToList} variant='default'>
              Volver a la lista de clientes
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  // If we don't have a client to display, show an error
  if (!displayClient) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button variant='outline' size='icon' onClick={handleBack}>
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <Heading
                title='Detalle de Cliente'
                description='Cliente no encontrado'
              />
            </div>
          </div>

          <Separator />

          <Alert variant='destructive'>
            <AlertTitle>Cliente no encontrado</AlertTitle>
            <AlertDescription>
              No se pudo encontrar la información del cliente solicitado.
            </AlertDescription>
          </Alert>

          <div className='flex justify-center'>
            <Button onClick={handleGoToList} variant='default'>
              Volver a la lista de clientes
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBack}
              className='border-primary/30 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/20'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <Heading
              title='Detalle de Cliente'
              description='Información completa del cliente'
            />
          </div>
        </div>

        <Separator />

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {/* Información principal del cliente */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5 text-primary' />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Nombre
                  </p>
                  <p className='text-lg font-semibold'>{displayClient.name}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    DNI
                  </p>
                  <p className='text-lg font-semibold'>{displayClient.dni}</p>
                </div>
              </div>

              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Dirección
                </p>
                <div className='flex items-start gap-2'>
                  <MapPin className='mt-1 h-4 w-4 text-muted-foreground' />
                  <p className='text-base'>
                    {displayClient?.residentialAddress}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Correo Electrónico
                  </p>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-muted-foreground' />
                    <p className='text-base'>{displayClient.email}</p>
                  </div>
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Teléfono
                  </p>
                  <div className='flex items-center gap-2'>
                    <Phone className='h-4 w-4 text-muted-foreground' />
                    <p className='text-base'>{displayClient.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de riesgo */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <FileText className='h-5 w-5 text-primary' />
                  Perfil de Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Puntuación de Riesgo
                  </p>
                  <div className='mt-2 flex items-center gap-3'>
                    <div className='flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary/20'>
                      <span className='text-xl font-bold'>
                        {displayClient.lastRiskScore}
                      </span>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Nivel de Riesgo
                      </p>
                      <Badge
                        className={getRiskScoreColor(
                          displayClient.lastRiskScore
                        )}
                      >
                        {getRiskLevelText(displayClient.lastRiskScore)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className='mt-4'>
                  <div className='h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
                    <div
                      className='h-2 rounded-full bg-primary'
                      style={{
                        width: `${(displayClient.lastRiskScore / 850) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className='mt-1 flex justify-between text-xs text-muted-foreground'>
                    <span>0</span>
                    <span>850</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acciones */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Button
                  variant='outline'
                  className='w-full justify-start gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/20'
                  onClick={() =>
                    router.push(
                      '/dashboard/loan-requests?dni=' + displayClient.dni
                    )
                  }
                >
                  <FileText className='h-4 w-4' />
                  Ver Solicitudes de Préstamo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
