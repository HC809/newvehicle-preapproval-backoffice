'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Image,
  File,
  FileCode,
  CheckCircle,
  XCircle,
  Calculator,
  Search
} from 'lucide-react';

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
import useAxios from '@/hooks/use-axios';
import {
  useLoanRequestDetail,
  useCheckEquifax,
  useMarkEquifaxChecked,
  useMarkBantotalChecked
} from '@/features/loan-requests/api/loan-request-service';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';

export default function LoanRequestDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const apiClient = useAxios();
  const [error, setError] = useState<string | null>(null);
  const [loadingDocumentId, setLoadingDocumentId] = useState<string | null>(
    null
  );
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
  const equifaxMutation = useCheckEquifax(apiClient);
  const markEquifaxCheckedMutation = useMarkEquifaxChecked(apiClient);
  const markBantotalCheckedMutation = useMarkBantotalChecked(apiClient);

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

  // Función para abrir el documento en una nueva pestaña
  const handleViewDocument = async (documentId: string) => {
    try {
      setLoadingDocumentId(documentId);

      // Verificar que el cliente API esté inicializado
      if (!apiClient) {
        throw new Error('Cliente API no inicializado');
      }

      // Obtener la URL base de la API
      let apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      if (!apiUrl) {
        apiUrl = 'https://localhost:7298/api';
      }

      // Realizar la solicitud para obtener el documento
      const response = await apiClient.get(
        `/loan-documents/content/${documentId}`,
        {
          responseType: 'arraybuffer',
          headers: {
            Accept: 'application/pdf,image/*,application/xml,text/xml,*/*'
          }
        }
      );

      // Verificar que la respuesta contiene datos
      if (!response.data) {
        throw new Error('El documento está vacío');
      }

      // Obtener el tipo de contenido del header de la respuesta
      const contentType =
        response.headers['content-type'] || 'application/octet-stream';

      // Crear un blob a partir de los datos
      const blob = new Blob([response.data], { type: contentType });

      // Crear una URL para el blob
      const blobUrl = URL.createObjectURL(blob);

      // Crear un enlace temporal para descargar el archivo
      const link = document.createElement('a');
      link.href = blobUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      // Simular clic en el enlace para abrir en una nueva pestaña
      document.body.appendChild(link);
      link.click();

      // Eliminar el enlace temporal y liberar la URL del blob
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 100);
    } catch (err: any) {
      console.error('Error al abrir el documento:', err);
      alert(`Error al abrir el documento: ${err.message}`);
    } finally {
      setLoadingDocumentId(null);
    }
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
          // Actualizar el estado de la solicitud
          markEquifaxCheckedMutation.mutate(id as string, {
            onSuccess: async () => {
              try {
                // Refrescar los datos para obtener la información actualizada
                // incluyendo el nuevo documento de Equifax
                await refetch();
                setShowFullPageLoader(false);
              } catch (error) {
                console.error('Error al recargar los datos:', error);
                setLoaderError(
                  'Error al recargar los datos. Por favor, actualice la página manualmente.'
                );
              }
            },
            onError: (error) => {
              setLoaderError(error);
            }
          });
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
      // Actualizar el estado de la solicitud
      markBantotalCheckedMutation.mutate(id as string, {
        onSuccess: async () => {
          try {
            // Refrescar los datos para obtener la información actualizada
            await refetch();
            setShowFullPageLoader(false);
          } catch (error) {
            console.error('Error al recargar los datos:', error);
            setLoaderError(
              'Error al recargar los datos. Por favor, actualice la página manualmente.'
            );
          }
        },
        onError: (error) => {
          setLoaderError(error);
        }
      });
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
      markEquifaxCheckedMutation.reset();

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
              markEquifaxCheckedMutation.mutate(id as string, {
                onSuccess: () => {
                  refetch();
                  setShowFullPageLoader(false);
                },
                onError: (error) => {
                  setLoaderError(error);
                }
              });
            },
            onError: (error) => {
              setLoaderError(error);
            }
          }
        );
      }
    } else if (
      markBantotalCheckedMutation.isPending ||
      markBantotalCheckedMutation.isError
    ) {
      markBantotalCheckedMutation.reset();

      // Volver a ejecutar el cálculo del préstamo
      setFullPageLoaderMessage('Calculando cuota y detalles del préstamo');
      setFullPageLoaderSubMessage(
        'Estamos calculando los detalles del préstamo. Este proceso puede tardar unos segundos.'
      );

      setTimeout(() => {
        markBantotalCheckedMutation.mutate(id as string, {
          onSuccess: () => {
            refetch();
            setShowFullPageLoader(false);
          },
          onError: (error) => {
            setLoaderError(error);
          }
        });
      }, 2000);
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
                            onClick={() => handleViewDocument(doc.id)}
                            disabled={loadingDocumentId === doc.id}
                          >
                            {loadingDocumentId === doc.id
                              ? 'Cargando...'
                              : 'Ver'}
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
                      markEquifaxCheckedMutation.isPending ||
                      loanRequestDetail.loanRequest.equifaxChecked
                    }
                    className='gap-2'
                  >
                    <Search className='h-4 w-4' />
                    {equifaxMutation.isPending ||
                    markEquifaxCheckedMutation.isPending
                      ? 'Consultando...'
                      : loanRequestDetail.loanRequest.equifaxChecked
                        ? 'Equifax Consultado'
                        : 'Consultar Equifax'}
                  </Button>

                  <Button
                    variant='outline'
                    onClick={handleCalculateLoan}
                    disabled={
                      markBantotalCheckedMutation.isPending ||
                      !loanRequestDetail.loanRequest.equifaxChecked ||
                      loanRequestDetail.loanRequest.bantotalChecked
                    }
                    className='gap-2'
                  >
                    <Calculator className='h-4 w-4' />
                    {markBantotalCheckedMutation.isPending
                      ? 'Calculando...'
                      : loanRequestDetail.loanRequest.bantotalChecked
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
                    className='gap-2 bg-green-600 hover:bg-green-700'
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
