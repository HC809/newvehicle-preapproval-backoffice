'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  History,
  Pencil
} from 'lucide-react';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FullPageLoader } from '@/components/ui/full-page-loader';
//import { disableTabHighlight } from '@/utils/ui-utils';

import {
  MainInfoCard,
  RejectionAlert,
  FinancialSummaryCard,
  //ResponsiblePersonsCard,
  VerificationChecklistCard,
  ResponsiblePersonsCard
} from '@/features/loan-requests/components/loan-request-detail';
import { DocumentViewer } from '@/features/loan-requests/components/document-viewer';
import useAxios from '@/hooks/use-axios';
import {
  useLoanRequestDetail,
  useRegisterEquifax,
  useCheckBantotal,
  useApproveByAgent,
  useRejectByAgent,
  useApproveByManager,
  useRejectByManager
} from '@/features/loan-requests/api/loan-request-service';
import { useCalculateLoan } from '@/features/loan-requests/api/loan-calculation-service';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import { LoanRequestStatus } from 'types/LoanRequests';
import { UserRole } from 'types/User';
import { LoanRequestTimeline } from '@/features/loan-requests/components/loan-request-timeline';
import { RejectionModal } from '@/features/loan-requests/components/rejection-modal';
import { LoanRequestEditForm } from '@/features/loan-requests/components';

export default function LoanRequestDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const { data: session } = useSession();
  const isAdmin = !!session?.isSystemAdmin;
  const userRole = session?.role;

  const apiClient = useAxios();

  const [error, setError] = useState<string | null>(null);
  const [showFullPageLoader, setShowFullPageLoader] = useState(false);
  const [fullPageLoaderMessage, setFullPageLoaderMessage] = useState('');
  const [fullPageLoaderSubMessage, setFullPageLoaderSubMessage] = useState('');
  const [loaderError, setLoaderError] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [isManagerRejection, setIsManagerRejection] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch loan request details from API
  const {
    data: loanRequestDetail,
    isLoading,
    isError,
    error: fetchError,
    refetch
  } = useLoanRequestDetail(apiClient!, id as string);

  // Mutaciones
  const equifaxMutation = useRegisterEquifax(apiClient!);
  const bantotalMutation = useCheckBantotal(apiClient!);
  const loanCalculationMutation = useCalculateLoan(apiClient!);
  const approveByAgentMutation = useApproveByAgent(apiClient!);
  const rejectByAgentMutation = useRejectByAgent(apiClient!);
  const approveByManagerMutation = useApproveByManager(apiClient!);
  const rejectByManagerMutation = useRejectByManager(apiClient!);

  // Efecto para eliminar el resaltado en las tabs cuando se presiona una tecla
  // useEffect(() => {
  //   const { cleanup } = disableTabHighlight();
  //   return cleanup;
  // }, []);

  useEffect(() => {
    // Set error if there's a fetch error
    if (isError && fetchError) {
      setError(`Error al cargar los datos: ${fetchError.message}`);
    } else {
      setError(null);
    }
  }, [isError, fetchError]);

  if (!apiClient) {
    return null; // or some error UI
  }

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

  // Función para revisar en Bantotal
  const handleCheckBantotal = async () => {
    if (!loanRequestDetail) return;

    const loanRequestId = loanRequestDetail.loanRequest.id;

    bantotalMutation.mutate(loanRequestId, {
      onSuccess: () => {
        refetch();
        toast.success('Revisión en Bantotal completada exitosamente');
      },
      onError: (error: Error) => {
        toast.error(`Error al revisar en Bantotal: ${error.message}`);
      }
    });
  };

  // Función para realizar el cálculo del préstamo
  const handleCalculateLoan = async () => {
    if (!loanRequestDetail) return;

    const loanRequestId = loanRequestDetail.loanRequest.id;

    loanCalculationMutation.mutate(loanRequestId, {
      onSuccess: () => {
        refetch();
        toast.success('Cálculo de préstamo completado exitosamente');
      },
      onError: (error: Error) => {
        toast.error(`Error al calcular el préstamo: ${error.message}`);
      }
    });
  };

  // Función para aprobar la solicitud
  const handleApproveLoan = async () => {
    if (!loanRequestDetail) return;

    try {
      if (userRole === UserRole.BusinessDevelopment_User) {
        await approveByAgentMutation.mutateAsync(
          loanRequestDetail.loanRequest.id
        );
      } else if (userRole === UserRole.BusinessDevelopment_Admin) {
        await approveByManagerMutation.mutateAsync(
          loanRequestDetail.loanRequest.id
        );
      }

      await refetch();
      toast.success('Solicitud aprobada exitosamente');
    } catch (error) {
      toast.error('Error al aprobar la solicitud');
    }
  };

  // Función para rechazar la solicitud
  const handleRejectLoan = async () => {
    if (!loanRequestDetail) return;

    setIsManagerRejection(userRole === UserRole.BusinessDevelopment_Admin);
    setShowRejectionModal(true);
  };

  // Función para manejar el envío del formulario de rechazo
  const handleRejectionSubmit = async (rejectionReason: string) => {
    if (!loanRequestDetail) return;

    try {
      if (isManagerRejection) {
        await rejectByManagerMutation.mutateAsync({
          loanRequestId: loanRequestDetail.loanRequest.id,
          rejectionReason
        });
      } else {
        await rejectByAgentMutation.mutateAsync({
          loanRequestId: loanRequestDetail.loanRequest.id,
          rejectionReason
        });
      }

      await refetch();
      toast.success('Solicitud rechazada exitosamente');
      setShowRejectionModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al rechazar la solicitud');
    }
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

  const canApproveReject = (status: LoanRequestStatus, request: any) => {
    if (!userRole) return false;

    const isBusinessDevUser = userRole === UserRole.BusinessDevelopment_User;
    const isBusinessDevAdmin = userRole === UserRole.BusinessDevelopment_Admin;

    if (isBusinessDevUser) {
      // Para BusinessDevelopment_User, solo mostrar botones si está en Pending y tiene todas las verificaciones
      return (
        status === LoanRequestStatus.Pending &&
        request.equifaxChecked &&
        request.bantotalChecked &&
        request.financingCalculated
      );
    }

    if (isBusinessDevAdmin) {
      // Para BusinessDevelopment_Admin, solo mostrar botones si está en ApprovedByAgent
      return status === LoanRequestStatus.ApprovedByAgent;
    }

    return false;
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

          {loanRequestDetail && (
            <div className='flex gap-2'>
              {loanRequestDetail.loanRequest.equifaxChecked &&
                loanRequestDetail.loanRequest.bantotalChecked &&
                loanRequestDetail.loanRequest.financingCalculated && (
                  <Button
                    variant='outline'
                    onClick={() => setShowEditModal(true)}
                    className='gap-2'
                  >
                    <Pencil className='h-4 w-4' />
                    Editar
                  </Button>
                )}
              <Button
                variant='outline'
                onClick={() => setShowTimeline(true)}
                className='gap-2'
              >
                <History className='h-4 w-4' />
                Ver Historial
              </Button>
              {canApproveReject(
                loanRequestDetail.loanRequest.status,
                loanRequestDetail.loanRequest
              ) && (
                <>
                  <Button
                    variant='default'
                    onClick={handleApproveLoan}
                    disabled={
                      approveByAgentMutation.isPending ||
                      approveByManagerMutation.isPending
                    }
                    className='gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
                  >
                    {approveByAgentMutation.isPending ||
                    approveByManagerMutation.isPending ? (
                      'Aprobando...'
                    ) : (
                      <>
                        <CheckCircle className='h-4 w-4' />
                        Aprobar
                      </>
                    )}
                  </Button>
                  <Button
                    variant='destructive'
                    onClick={handleRejectLoan}
                    className='gap-2'
                  >
                    <XCircle className='h-4 w-4' />
                    Rechazar
                  </Button>
                </>
              )}
            </div>
          )}
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
                  <div className='flex h-[300px] flex-col rounded-lg border border-l-4 border-l-primary p-4 shadow-sm'>
                    <h3 className='mb-4 flex items-center gap-2 text-lg font-semibold'>
                      <FileText className='h-5 w-5 text-primary dark:text-primary' />
                      <span>Documentos</span>
                    </h3>
                    <div className='grid flex-1 grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 md:grid-cols-3'>
                      {loanRequestDetail.documents.map((doc) => (
                        <DocumentViewer key={doc.id} document={doc} />
                      ))}
                    </div>
                  </div>
                )}
            </div>

            <div className='space-y-6'>
              <FinancialSummaryCard
                loanRequest={loanRequestDetail.loanRequest}
                loanCalculation={loanRequestDetail.loanCalculation}
                client={loanRequestDetail.client}
              />

              {!isAdmin ? (
                <VerificationChecklistCard
                  loanRequest={loanRequestDetail.loanRequest}
                  onCheckEquifax={handleCheckEquifax}
                  onCheckBantotal={handleCheckBantotal}
                  onCalculateLoan={handleCalculateLoan}
                  isCheckingEquifax={equifaxMutation.isPending}
                  isCheckingBantotal={bantotalMutation.isPending}
                  isCalculatingLoan={loanCalculationMutation.isPending}
                />
              ) : (
                <ResponsiblePersonsCard
                  loanRequest={loanRequestDetail.loanRequest}
                />
              )}
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

        {loanRequestDetail && (
          <>
            <LoanRequestTimeline
              isOpen={showTimeline}
              onClose={() => setShowTimeline(false)}
              events={loanRequestDetail.events || []}
            />

            <RejectionModal
              isOpen={showRejectionModal}
              onClose={() => {
                if (
                  !rejectByAgentMutation.isPending &&
                  !rejectByManagerMutation.isPending
                ) {
                  setShowRejectionModal(false);
                }
              }}
              onSubmit={handleRejectionSubmit}
              title={
                isManagerRejection
                  ? 'Rechazar Solicitud (Gerente de Oficial de Negocios)'
                  : 'Rechazar Solicitud (Oficial de Negocios)'
              }
              description={
                isManagerRejection
                  ? 'Por favor, ingrese la razón del rechazo de la solicitud como Gerente de Oficial de Negocios.'
                  : 'Por favor, ingrese la razón del rechazo de la solicitud como Oficial de Negocios.'
              }
              isSubmitting={
                rejectByAgentMutation.isPending ||
                rejectByManagerMutation.isPending
              }
            />

            <LoanRequestEditForm
              open={showEditModal}
              onOpenChange={setShowEditModal}
              loanRequest={loanRequestDetail.loanRequest}
              onSuccess={() => {
                refetch();
              }}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}
