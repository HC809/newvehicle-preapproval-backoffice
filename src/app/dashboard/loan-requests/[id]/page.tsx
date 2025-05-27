'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Building,
  CheckCircle,
  History,
  Pencil,
  XCircle,
  Users,
  MoreVertical,
  FileText
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
import useAxios from '@/hooks/use-axios';
import {
  useLoanRequestDetail,
  useRegisterEquifax,
  useCheckBantotal,
  useApproveByAgent,
  useRejectByAgent,
  useApproveByManager,
  useRejectByManager,
  useApproveForCommittee,
  useAddBranchManagerComment
} from '@/features/loan-requests/api/loan-request-service';
import { useCalculateLoan } from '@/features/loan-requests/api/loan-calculation-service';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import { LoanRequestStatus } from 'types/LoanRequests';
import { UserRole } from 'types/User';
import { LoanRequestTimeline } from '@/features/loan-requests/components/loan-request-timeline';
import { RejectionModal } from '@/features/loan-requests/components/rejection-modal';
import { ApprovalModal } from '@/features/loan-requests/components/approval-modal';
import { LoanRequestEditForm } from '@/features/loan-requests/components';
import AssignVisitForm from '@/features/loan-requests/components/assign-visit-form';
import { ChatButton } from '@/features/chat/ChatButton';
import { DocumentsSection } from '@/features/loan-documents/components/documents-section';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { BranchManagerCommentModal } from '@/features/loan-requests/components/branch-manager-comment-modal';

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
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isManagerRejection, setIsManagerRejection] = useState(false);
  const [isManagerApproval, setIsManagerApproval] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignVisitModal, setShowAssignVisitModal] = useState(false);
  const [showCommitteeApprovalModal, setShowCommitteeApprovalModal] =
    useState(false);
  const [showBranchManagerCommentModal, setShowBranchManagerCommentModal] =
    useState(false);

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
  const approveForCommitteeMutation = useApproveForCommittee(apiClient!);
  const addBranchManagerCommentMutation = useAddBranchManagerComment(
    apiClient!
  );

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

    setIsManagerApproval(userRole === UserRole.BusinessDevelopment_Admin);
    setShowApprovalModal(true);
  };

  // Función para manejar el envío del formulario de aprobación
  const handleApprovalSubmit = async () => {
    if (!loanRequestDetail) return;

    try {
      if (isManagerApproval) {
        await approveByManagerMutation.mutateAsync(
          loanRequestDetail.loanRequest.id
        );
      } else {
        await approveByAgentMutation.mutateAsync(
          loanRequestDetail.loanRequest.id
        );
      }

      await refetch();
      toast.success('Solicitud aprobada exitosamente');
      setShowApprovalModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al aprobar la solicitud');
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

  // Función para aprobar para comité
  const handleApproveForCommittee = async () => {
    if (!loanRequestDetail) return;

    try {
      await approveForCommitteeMutation.mutateAsync(
        loanRequestDetail.loanRequest.id
      );
      await refetch();
      toast.success('Solicitud aprobada para comité exitosamente');
      setShowCommitteeApprovalModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al aprobar la solicitud para comité');
    }
  };

  // Check if user can add branch manager comment
  const canAddBranchManagerComment = (status: LoanRequestStatus) => {
    if (!userRole) return false;
    return (
      userRole === UserRole.BranchManager &&
      [
        LoanRequestStatus.VisitRegistered,
        LoanRequestStatus.BranchManagerReview
      ].includes(status)
    );
  };

  // Handle branch manager comment submission
  const handleBranchManagerCommentSubmit = async (comment: string) => {
    if (!loanRequestDetail) return;

    try {
      await addBranchManagerCommentMutation.mutateAsync({
        loanRequestId: loanRequestDetail.loanRequest.id,
        comment
      });
      await refetch();
      toast.success('Comentario agregado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al agregar el comentario');
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

  // Check if user can assign visit (when status is AcceptedByCustomer and user is BusinessDevelopment_User)
  const canAssignVisit = (status: LoanRequestStatus) => {
    if (!userRole) return false;
    return (
      status === LoanRequestStatus.AcceptedByCustomer &&
      userRole === UserRole.BusinessDevelopment_User
    );
  };

  // Check if user can approve for committee
  const canApproveForCommittee = (status: LoanRequestStatus) => {
    if (!userRole) return false;
    return (
      status === LoanRequestStatus.VisitRegistered &&
      (userRole === UserRole.BusinessDevelopment_User ||
        userRole === UserRole.BusinessDevelopment_Admin)
    );
  };

  // Renderizar el botón de chat para la solicitud de préstamo
  const renderChatButton = () => {
    if (!loanRequestDetail) return null;

    // Verificar si el usuario tiene permiso para ver el chat basado en su rol
    const canViewChat = () => {
      // Si no hay rol definido
      if (!userRole) return false;

      // Solo mostrar el chat para las solicitudes que no estén rechazadas o canceladas
      const status = loanRequestDetail.loanRequest.status;
      return ![
        LoanRequestStatus.RejectedByAgent,
        LoanRequestStatus.RejectedByManager,
        LoanRequestStatus.Cancelled,
        LoanRequestStatus.DeclinedByCustomer
      ].includes(status);
    };

    // Si el usuario no puede ver el chat, no mostrar nada
    if (!canViewChat()) {
      return null;
    }

    // Usar directamente los participantes del loanRequestDetail si existen
    // Si no existe, usar un array vacío
    const chatParticipants = loanRequestDetail.participants || [];

    // Renderizar un único botón de chat grupal
    return (
      <div className='inline-block'>
        <ChatButton
          loanRequestId={String(id)}
          participants={chatParticipants}
          variant='default'
        />
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col space-y-4'>
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
      <div className='flex flex-1 flex-col space-y-4'>
        {/* Encabezado con título y botones de acción */}
        <div className='flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <Button
                variant='ghost'
                size='icon'
                onClick={handleBack}
                className='mr-2'
              >
                <ArrowLeft className='h-5 w-5' />
              </Button>
              <Heading
                title='Detalle de Solicitud'
                description='Información detallada de la solicitud de préstamo'
              />
            </div>
            {loanRequestDetail && (
              <div className='flex items-center gap-2'>
                {loanRequestDetail.loanRequest.equifaxChecked &&
                  loanRequestDetail.loanRequest.bantotalChecked &&
                  loanRequestDetail.loanRequest.financingCalculated &&
                  ![
                    LoanRequestStatus.RejectedByAgent,
                    LoanRequestStatus.RejectedByManager,
                    LoanRequestStatus.DeclinedByCustomer
                  ].includes(loanRequestDetail.loanRequest.status) &&
                  userRole !== UserRole.BranchManager && (
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
                  title='Ver historial de cambios'
                >
                  <History className='mr-2 h-4 w-4' />
                  Historial
                </Button>
                {canAssignVisit(loanRequestDetail.loanRequest.status) && (
                  <Button
                    variant='outline'
                    onClick={() => setShowAssignVisitModal(true)}
                    className='gap-2 bg-purple-700 text-white hover:bg-purple-800 hover:text-white'
                  >
                    <Building className='h-4 w-4' />
                    Asignar Visita
                  </Button>
                )}
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
                  </>
                )}
                {canApproveForCommittee(
                  loanRequestDetail.loanRequest.status
                ) && (
                  <Button
                    variant='outline'
                    onClick={() => setShowCommitteeApprovalModal(true)}
                    disabled={approveForCommitteeMutation.isPending}
                    className='gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-gray-800'
                  >
                    {approveForCommitteeMutation.isPending ? (
                      'Aprobando...'
                    ) : (
                      <>
                        <Users className='h-4 w-4' />
                        Aprobar para Comité
                      </>
                    )}
                  </Button>
                )}
                {canAddBranchManagerComment(
                  loanRequestDetail.loanRequest.status
                ) && (
                  <Button
                    variant='outline'
                    onClick={() => setShowBranchManagerCommentModal(true)}
                    className='gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-gray-800'
                  >
                    <FileText className='h-4 w-4' />
                    {loanRequestDetail.loanRequest.branchManagerComment
                      ? 'Editar Comentario'
                      : 'Agregar Comentario'}
                  </Button>
                )}
                {renderChatButton()}
                {userRole !== UserRole.BranchManager && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        disabled={[
                          LoanRequestStatus.RejectedByAgent,
                          LoanRequestStatus.RejectedByManager,
                          LoanRequestStatus.DeclinedByCustomer
                        ].includes(loanRequestDetail.loanRequest.status)}
                      >
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem
                        onClick={handleRejectLoan}
                        className='text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400'
                      >
                        <XCircle className='mr-2 h-4 w-4' />
                        Rechazar solicitud
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </div>
          <Separator />
        </div>

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
                  visit={loanRequestDetail.visit}
                  branchManagerComment={
                    loanRequestDetail.loanRequest.branchManagerComment
                  }
                />
                <RejectionAlert
                  rejectionReason={
                    loanRequestDetail.loanRequest.rejectionReason
                  }
                />

                <DocumentsSection
                  documents={loanRequestDetail.documents || []}
                  loanRequestId={loanRequestDetail.loanRequest.id}
                  clientId={loanRequestDetail.client?.id}
                  onDocumentUploaded={() => refetch()}
                  onDocumentDeleted={() => refetch()}
                />
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
                error={
                  isManagerRejection
                    ? rejectByManagerMutation.error
                    : rejectByAgentMutation.error
                }
              />

              <ApprovalModal
                isOpen={showApprovalModal}
                onClose={() => {
                  if (
                    !approveByAgentMutation.isPending &&
                    !approveByManagerMutation.isPending
                  ) {
                    setShowApprovalModal(false);
                  }
                }}
                onSubmit={handleApprovalSubmit}
                title={
                  isManagerApproval
                    ? 'Aprobar Solicitud (Gerente de Oficial de Negocios)'
                    : 'Aprobar Solicitud (Oficial de Negocios)'
                }
                isSubmitting={
                  approveByAgentMutation.isPending ||
                  approveByManagerMutation.isPending
                }
              />

              <ApprovalModal
                isOpen={showCommitteeApprovalModal}
                onClose={() => {
                  if (!approveForCommitteeMutation.isPending) {
                    setShowCommitteeApprovalModal(false);
                  }
                }}
                onSubmit={handleApproveForCommittee}
                title='Aprobar Solicitud para Comité'
                description=''
                isSubmitting={approveForCommitteeMutation.isPending}
              />

              <LoanRequestEditForm
                open={showEditModal}
                onOpenChange={setShowEditModal}
                loanRequest={loanRequestDetail.loanRequest}
                onSuccess={() => {
                  refetch();
                }}
              />

              <AssignVisitForm
                open={showAssignVisitModal}
                onOpenChange={setShowAssignVisitModal}
                loanRequestId={loanRequestDetail.loanRequest.id}
                onSuccess={() => {
                  refetch();
                }}
              />

              <BranchManagerCommentModal
                isOpen={showBranchManagerCommentModal}
                onClose={() => {
                  if (!addBranchManagerCommentMutation.isPending) {
                    setShowBranchManagerCommentModal(false);
                  }
                }}
                onSubmit={handleBranchManagerCommentSubmit}
                isSubmitting={addBranchManagerCommentMutation.isPending}
                error={addBranchManagerCommentMutation.error?.toString()}
                existingComment={
                  loanRequestDetail.loanRequest.branchManagerComment
                }
              />
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
