'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calculator,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FullPageLoader } from '@/components/ui/full-page-loader';

import {
  MainInfoCard,
  RejectionAlert,
  FinancialSummaryCard,
  //ResponsiblePersonsCard,
  VerificationChecklistCard
} from '@/features/loan-requests/components/loan-request-detail';
import { DocumentViewer } from '@/features/loan-requests/components/document-viewer';
import useAxios from '@/hooks/use-axios';
import {
  useLoanRequestDetail,
  useRegisterEquifax
} from '@/features/loan-requests/api/loan-request-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoanRequestDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const apiClient = useAxios();
  const [error, setError] = useState<string | null>(null);
  const [showFullPageLoader, setShowFullPageLoader] = useState(false);
  const [fullPageLoaderMessage, setFullPageLoaderMessage] = useState('');
  const [fullPageLoaderSubMessage, setFullPageLoaderSubMessage] = useState('');
  const [loaderError, setLoaderError] = useState<string | null>(null);

  // Fetch loan request details from API
  const {
    data: loanRequestDetail,
    isLoading,
    isError,
    error: fetchError,
    refetch
  } = useLoanRequestDetail(apiClient, id as string);

  // Mutaciones
  const equifaxMutation = useRegisterEquifax(apiClient);

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

  // Función para consultar Equifax
  const handleCheckEquifax = async () => {
    if (!loanRequestDetail) return;

    const clientDni = loanRequestDetail.loanRequest.dni;
    const loanRequestId = loanRequestDetail.loanRequest.id;

    setShowFullPageLoader(true);
    setLoaderError(null);
    setFullPageLoaderMessage('Consultando información crediticia en Equifax');
    setFullPageLoaderSubMessage(
      'Este proceso puede tardar hasta 10 segundos. Por favor, espere mientras consultamos la información crediticia del cliente.'
    );

    // Llamar al endpoint de Equifax
    equifaxMutation.mutate(
      { clientDni, loanRequestId },
      {
        onSuccess: () => {
          try {
            // Simplemente refrescamos los datos para obtener la información actualizada
            setTimeout(async () => {
              try {
                await refetch(); // Esto debería llamar a /loan-requests/{id}
                setShowFullPageLoader(false);
              } catch (error) {
                setLoaderError(
                  'Error al recargar los datos. Por favor, actualice la página manualmente.'
                );
              }
            }, 1000); // Un pequeño retraso para asegurar que el backend ha procesado todo
          } catch (error) {
            setLoaderError(
              'Error al recargar los datos. Por favor, actualice la página manualmente.'
            );
          }
        },
        onError: (error) => {
          setLoaderError(error);
        }
      }
    );
  };

  // Función para realizar el cálculo del préstamo
  const handleCalculateLoan = async () => {
    if (!loanRequestDetail) return;

    setShowFullPageLoader(true);
    setLoaderError(null);
    setFullPageLoaderMessage('Calculando cuota y detalles del préstamo');
    setFullPageLoaderSubMessage(
      'Estamos calculando los detalles del préstamo. Este proceso puede tardar unos segundos.'
    );

    // Simulación de cálculo de préstamo
    setTimeout(() => {
      setShowFullPageLoader(false);
      toast.success('Cálculo de préstamo completado');
    }, 2000);
  };

  // Función para aprobar la solicitud
  const handleApproveLoan = async () => {
    setShowFullPageLoader(true);
    setLoaderError(null);
    setFullPageLoaderMessage('Procesando aprobación de la solicitud');
    setFullPageLoaderSubMessage(
      'Por favor espere mientras completamos el proceso.'
    );

    // Simulación de procesamiento
    setTimeout(() => {
      setShowFullPageLoader(false);
      alert('Funcionalidad de aprobación pendiente de implementar');
    }, 1500);
  };

  // Función para rechazar la solicitud
  const handleRejectLoan = async () => {
    setShowFullPageLoader(true);
    setLoaderError(null);
    setFullPageLoaderMessage('Procesando rechazo de la solicitud');
    setFullPageLoaderSubMessage(
      'Por favor espere mientras completamos el proceso.'
    );

    // Simulación de procesamiento
    setTimeout(() => {
      setShowFullPageLoader(false);
      alert('Funcionalidad de rechazo pendiente de implementar');
    }, 1500);
  };

  // Función para cerrar el loader con error
  const handleCloseLoader = () => {
    setShowFullPageLoader(false);
    setLoaderError(null);
  };

  // Función para reintentar la operación
  const handleRetry = () => {
    setLoaderError(null);

    // Reiniciar las mutaciones para que puedan ser ejecutadas nuevamente
    if (equifaxMutation.isPending || equifaxMutation.isError) {
      equifaxMutation.reset();

      // Volver a ejecutar la consulta a Equifax
      if (loanRequestDetail) {
        const clientDni = loanRequestDetail.loanRequest.dni;
        const loanRequestId = loanRequestDetail.loanRequest.id;

        setFullPageLoaderMessage(
          'Consultando información crediticia en Equifax'
        );
        setFullPageLoaderSubMessage(
          'Este proceso puede tardar hasta 10 segundos. Por favor, espere mientras consultamos la información crediticia del cliente.'
        );

        equifaxMutation.mutate(
          { clientDni, loanRequestId },
          {
            onSuccess: () => {
              // Simplemente refrescamos los datos para obtener la información actualizada
              setTimeout(async () => {
                try {
                  await refetch(); // Esto debería llamar a /loan-requests/{id}
                  setShowFullPageLoader(false);
                } catch (error) {
                  setLoaderError(
                    'Error al recargar los datos. Por favor, actualice la página manualmente.'
                  );
                }
              }, 1000);
            },
            onError: (error) => {
              setLoaderError(error);
            }
          }
        );
      }
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
      {showFullPageLoader && (
        <FullPageLoader
          message={fullPageLoaderMessage}
          subMessage={fullPageLoaderSubMessage}
          error={loaderError}
          onRetry={handleRetry}
          onClose={handleCloseLoader}
        />
      )}
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
                        <DocumentViewer key={doc.id} document={doc} />
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

              {/* Comentamos ResponsiblePersonsCard para usuarios BusinessDevelopment_User */}
              {/* <ResponsiblePersonsCard
                loanRequest={loanRequestDetail.loanRequest}
              /> */}

              {/* Reemplazamos con el checklist de verificación */}
              <VerificationChecklistCard
                loanRequest={loanRequestDetail.loanRequest}
              />

              {/* Acciones principales */}
              <div className='space-y-4'>
                {/* Verificaciones */}
                <div className='flex flex-col space-y-2'>
                  <Button
                    variant='outline'
                    onClick={handleCheckEquifax}
                    disabled={
                      equifaxMutation.isPending ||
                      loanRequestDetail.loanRequest.equifaxChecked
                    }
                    className='gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/20'
                  >
                    <Search className='h-4 w-4' />
                    {equifaxMutation.isPending
                      ? 'Consultando...'
                      : loanRequestDetail.loanRequest.equifaxChecked
                        ? 'Equifax Consultado'
                        : 'Consultar Equifax'}
                  </Button>

                  <Button
                    variant='outline'
                    onClick={handleCalculateLoan}
                    disabled={
                      !loanRequestDetail.loanRequest.equifaxChecked ||
                      loanRequestDetail.loanRequest.bantotalChecked
                    }
                    className='gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/20'
                  >
                    <Calculator className='h-4 w-4' />
                    {loanRequestDetail.loanRequest.bantotalChecked
                      ? 'Cálculo Realizado'
                      : 'Calcular Préstamo'}
                  </Button>
                </div>

                {/* Separador */}
                <Separator />

                {/* Acciones finales (aprobar/rechazar) */}
                <div className='flex flex-col space-y-2'>
                  <Button
                    variant='default'
                    onClick={handleApproveLoan}
                    disabled={
                      !loanRequestDetail.loanRequest.equifaxChecked ||
                      !loanRequestDetail.loanRequest.bantotalChecked
                    }
                    className='gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
                  >
                    <CheckCircle className='h-4 w-4' />
                    Aprobar Solicitud
                  </Button>

                  <Button
                    variant='destructive'
                    onClick={handleRejectLoan}
                    disabled={
                      !loanRequestDetail.loanRequest.equifaxChecked ||
                      !loanRequestDetail.loanRequest.bantotalChecked
                    }
                    className='gap-2'
                  >
                    <XCircle className='h-4 w-4' />
                    Rechazar Solicitud
                  </Button>
                </div>
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
