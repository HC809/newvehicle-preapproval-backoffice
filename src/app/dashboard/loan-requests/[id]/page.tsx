'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { LoanRequest } from 'types/LoanRequests';
import { useLoanRequestStore } from '@/stores/loan-request-store';
import {
  MainInfoCard,
  CommentCard,
  RejectionAlert,
  FinancialSummaryCard,
  ResponsiblePersonsCard
} from '@/features/loan-requests/components/loan-request-detail';

export default function LoanRequestDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { selectedLoanRequest } = useLoanRequestStore();
  const [loanRequest, setLoanRequest] = useState<LoanRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    // Verificamos si tenemos la solicitud en el store y si coincide con el ID de la URL
    if (selectedLoanRequest && selectedLoanRequest.id === id) {
      setLoanRequest(selectedLoanRequest);
      setError(null);
    } else {
      // Si no tenemos la solicitud en el store o no coincide con el ID, mostramos un mensaje
      setError(
        'No se encontró la solicitud. Por favor, regrese a la lista y seleccione una solicitud.'
      );
    }
  }, [id, selectedLoanRequest]);

  const handleBack = () => {
    router.back();
  };

  // Botón para volver a la lista de solicitudes
  const handleGoToList = () => {
    router.push('/dashboard/loan-requests');
  };

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
        ) : loanRequest ? (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            {/* Columna izquierda - Información principal */}
            <div className='space-y-6 lg:col-span-2'>
              <MainInfoCard loanRequest={loanRequest} />
              <CommentCard comment={loanRequest.comment} />
              <RejectionAlert rejectionReason={loanRequest.rejectionReason} />
            </div>

            {/* Columna derecha - Información adicional y acciones */}
            <div className='space-y-6'>
              <FinancialSummaryCard loanRequest={loanRequest} />
              <ResponsiblePersonsCard loanRequest={loanRequest} />

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
