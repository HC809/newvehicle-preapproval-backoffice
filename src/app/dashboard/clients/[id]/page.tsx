'use client';

import React, { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  MapPin,
  FileText,
  Calendar,
  Clock,
  CreditCard,
  Building,
  UserCog
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

import useAxios from '@/hooks/use-axios';
import { useClientDetail } from '@/features/clients/api/client-service';
import { useClientStore } from '@/stores/client-store';
import { formatHNL } from '@/utils/formatCurrency';
import {
  translateStatus,
  getStatusVariant,
  getStatusClassName
} from '@/utils/getStatusColor';
import { formatLoanRequestId } from '@/utils/formatId';
import { DocumentsSection } from '@/features/loan-documents/components/documents-section';
import { translateIncomeType } from '@/utils/translateIncomeType';

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
                title='Perfil del Cliente'
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
                title='Perfil del Cliente'
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
          <Card className='h-[450px]'>
            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2'>
                  <User className='h-5 w-5 text-purple-500' />
                  Información Personal
                </CardTitle>
                <div className='flex items-center gap-2'>
                  <Badge
                    className={getRiskScoreColor(displayClient.lastRiskScore)}
                  >
                    Scoring: {displayClient.lastRiskScore}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className='h-[calc(500px-60px)] space-y-6 overflow-y-auto'>
              {/* Información básica */}
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      Nombre
                    </p>
                    <p className='text-base font-semibold'>
                      {displayClient.name}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      DNI
                    </p>
                    <div className='flex items-center gap-2'>
                      <CreditCard className='h-4 w-4 text-purple-500' />
                      <p className='text-base font-semibold'>
                        {displayClient.dni}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de ingresos */}
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {displayClient.incomeType && (
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-muted-foreground'>
                        Tipo de Ingreso
                      </p>
                      <div className='flex items-center gap-2'>
                        <Building className='h-4 w-4 text-purple-500' />
                        <p className='text-base'>
                          {translateIncomeType(displayClient.incomeType)}
                        </p>
                      </div>
                    </div>
                  )}
                  {displayClient.monthlyIncome && (
                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-muted-foreground'>
                        Ingreso Mensual
                      </p>
                      <div className='flex items-center gap-2'>
                        <CreditCard className='h-4 w-4 text-green-500' />
                        <p className='text-base'>
                          {formatHNL(displayClient.monthlyIncome)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de contacto */}
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      Teléfono
                    </p>
                    <div className='flex items-center gap-2'>
                      <span className='text-green-500'>📞</span>
                      <p className='text-base'>{displayClient.phoneNumber}</p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      Ciudad
                    </p>
                    <div className='flex items-center gap-2'>
                      <MapPin className='h-4 w-4 text-purple-500' />
                      <p className='text-base'>{displayClient.city}</p>
                    </div>
                  </div>
                </div>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-muted-foreground'>
                    Dirección
                  </p>
                  <div className='flex items-start gap-2'>
                    <MapPin className='mt-1 h-4 w-4 text-orange-500' />
                    <p className='text-base'>
                      {displayClient.residentialAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información temporal */}
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      Fecha de Registro
                    </p>
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-4 w-4 text-blue-500' />
                      <p className='text-base'>
                        {format(new Date(displayClient.createdAt), 'PP', {
                          locale: es
                        })}
                      </p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-muted-foreground'>
                      Última Actualización
                    </p>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-blue-500' />
                      <p className='text-base'>
                        {format(new Date(displayClient.updatedAt), 'PP', {
                          locale: es
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentos */}
          <div className='h-[450px]'>
            <DocumentsSection
              documents={displayClient.documents || []}
              loanRequestId={displayClient.loanRequests?.[0]?.id}
              clientId={displayClient.id}
              onDocumentUploaded={() => {}}
              onDocumentDeleted={() => {}}
              height='450px'
              showUploadButton={false}
            />
          </div>

          {/* Lista de solicitudes */}
          <Card className='lg:col-span-2'>
            <CardHeader className='pb-2'>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5 text-primary' />
                Solicitudes de Préstamo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Concesionaria</TableHead>
                      <TableHead>Creado por</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Ciudad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Responsable</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayClient.loanRequests?.map((request) => (
                      <TableRow
                        key={request.id}
                        className='cursor-pointer hover:bg-muted/50'
                        onClick={() =>
                          router.push(`/dashboard/loan-requests/${request.id}`)
                        }
                      >
                        <TableCell className='font-medium'>
                          {formatLoanRequestId(request.id)}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Building className='h-4 w-4 text-blue-500 dark:text-blue-400' />
                            <span className='font-medium text-blue-700 dark:text-blue-300'>
                              {request.dealershipName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <User className='h-4 w-4 text-green-500 dark:text-green-400' />
                            <span className='font-medium text-green-700 dark:text-green-300'>
                              {request.creatorName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatHNL(request.requestedAmount)}
                        </TableCell>
                        <TableCell>{request.city}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(request.status)}
                            className={getStatusClassName(request.status)}
                          >
                            {translateStatus(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <UserCog className='h-4 w-4 text-purple-500 dark:text-purple-400' />
                            <span className='font-medium text-purple-700 dark:text-purple-300'>
                              {request.managerName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.createdAt), 'PP', {
                            locale: es
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
