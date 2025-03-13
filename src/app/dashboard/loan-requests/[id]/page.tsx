'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText, Image, File, FileCode } from 'lucide-react';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { LoanRequest, LoanRequestDetail } from 'types/LoanRequests';
import { useLoanRequestStore } from '@/stores/loan-request-store';
import {
  MainInfoCard,
  RejectionAlert,
  FinancialSummaryCard,
  ResponsiblePersonsCard
} from '@/features/loan-requests/components/loan-request-detail';
import useAxios from '@/hooks/use-axios';
import { useLoanRequestDetail } from '@/features/loan-requests/api/loan-request-service';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

export default function LoanRequestDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const apiClient = useAxios();
  const { selectedLoanRequest } = useLoanRequestStore();
  const [error, setError] = useState<string | null>(null);

  // Fetch loan request details from API
  const {
    data: loanRequestDetail,
    isLoading,
    isError,
    error: fetchError
  } = useLoanRequestDetail(apiClient, id as string);

  // Efecto para eliminar el resaltado en las tabs cuando se presiona una tecla
  useEffect(() => {
    const handleKeyDown = () => {
      if (document.activeElement) {
        (document.activeElement as HTMLElement).blur();
      }
    };

    // Agregar el event listener al documento
    document.addEventListener('keydown', handleKeyDown);

    // Agregar estilos CSS para eliminar el resaltado
    const style = document.createElement('style');
    style.innerHTML = `
      [data-state="active"] {
        outline: none !important;
        box-shadow: none !important;
        border-color: transparent !important;
      }
      
      *:focus, *:focus-visible {
        outline: none !important;
        box-shadow: none !important;
        border-color: transparent !important;
      }
    `;
    document.head.appendChild(style);

    // Limpiar el event listener y los estilos cuando el componente se desmonte
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Set error if there's a fetch error
    if (isError && fetchError) {
      setError(`Error al cargar los datos: ${fetchError.message}`);
    } else {
      setError(null);
    }
  }, [isError, fetchError]);

  const handleBack = () => {
    router.back();
  };

  // Botón para volver a la lista de solicitudes
  const handleGoToList = () => {
    router.push('/dashboard/loan-requests');
  };

  // Función para obtener el icono según el tipo de contenido
  const getDocumentIcon = (contentType: string) => {
    if (contentType.includes('pdf')) {
      return <FileText className='h-10 w-10 text-red-500' />;
    } else if (contentType.includes('image')) {
      return <Image className='h-10 w-10 text-blue-500' />;
    } else if (contentType.includes('xml')) {
      return <FileCode className='h-10 w-10 text-green-500' />;
    } else {
      return <File className='h-10 w-10 text-gray-500' />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button variant='outline' size='icon' onClick={handleBack}>
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <Heading
                title='Detalle de Solicitud de Préstamo'
                description='Cargando información...'
              />
            </div>
          </div>

          <Separator />

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            <div className='space-y-6 lg:col-span-2'>
              <Skeleton className='h-[300px] w-full rounded-lg' />
              <Skeleton className='h-[150px] w-full rounded-lg' />
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

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='outline' size='icon' onClick={handleBack}>
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <Heading
              title='Detalle de Solicitud de Préstamo'
              description='Información completa sobre la solicitud'
            />
          </div>
        </div>

        <Separator />

        {error ? (
          <div className='space-y-4'>
            <Alert variant='destructive'>
              <AlertTitle>No se encontraron datos</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className='flex justify-center'>
              <Button onClick={handleGoToList} variant='default'>
                Volver a la lista de solicitudes
              </Button>
            </div>
          </div>
        ) : loanRequestDetail ? (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            {/* Columna izquierda - Información principal */}
            <div className='space-y-6 lg:col-span-2'>
              <MainInfoCard
                loanRequest={loanRequestDetail.loanRequest}
                client={loanRequestDetail.client}
              />
              <RejectionAlert
                rejectionReason={loanRequestDetail.loanRequest.rejectionReason}
              />

              {/* Mostrar documentos si existen */}
              {loanRequestDetail.documents &&
                loanRequestDetail.documents.length > 0 && (
                  <div className='rounded-lg border p-4 shadow-sm'>
                    <h3 className='mb-4 text-lg font-semibold'>Documentos</h3>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
                      {loanRequestDetail.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className='flex flex-col items-center rounded-md border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900'
                        >
                          <div className='mb-2 flex h-16 w-16 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800'>
                            {getDocumentIcon(doc.contentType)}
                          </div>
                          <span
                            className='mb-1 line-clamp-1 text-center font-medium'
                            title={doc.fileName}
                          >
                            {doc.fileName}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {doc.documentType}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {format(new Date(doc.uploadedAt), 'PPP', {
                              locale: es
                            })}
                          </span>
                          <Button
                            variant='outline'
                            size='sm'
                            className='mt-2 w-full'
                          >
                            Ver
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Columna derecha - Información adicional y acciones */}
            <div className='space-y-6'>
              <FinancialSummaryCard
                loanRequest={loanRequestDetail.loanRequest}
              />
              <ResponsiblePersonsCard
                loanRequest={loanRequestDetail.loanRequest}
              />

              <div className='flex flex-col space-y-2'>
                <Button variant='default'>Editar Solicitud</Button>
                <Button variant='outline' onClick={handleBack}>
                  Volver a la lista
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertTitle>Solicitud no encontrada</AlertTitle>
            <AlertDescription>
              No se pudo encontrar la solicitud de préstamo con el ID
              especificado.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </PageContainer>
  );
}
