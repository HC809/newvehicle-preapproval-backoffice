import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  AlertCircle
} from 'lucide-react';
import { LoanRequest } from 'types/LoanRequests';

interface VerificationChecklistCardProps {
  loanRequest: LoanRequest;
}

export const VerificationChecklistCard = ({
  loanRequest
}: VerificationChecklistCardProps) => {
  // Calcular el progreso del proceso
  const stepsCompleted = [
    loanRequest.equifaxChecked,
    loanRequest.bantotalChecked,
    loanRequest.financingCalculated
  ].filter(Boolean).length;

  const totalSteps = 3;
  const progress = Math.round((stepsCompleted / totalSteps) * 100);

  return (
    <Card className='border-l-4 border-l-primary dark:border-l-primary'>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <ClipboardCheck className='h-5 w-5 text-primary dark:text-primary' />
          <span>Verificaciones</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Barra de progreso */}
        <div className='space-y-1'>
          <div className='flex items-center justify-between text-xs'>
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <div className='h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700'>
            <div
              className='h-2 rounded-full bg-primary transition-all duration-300 ease-in-out dark:bg-primary'
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className='space-y-3'>
          {/* Equifax Check */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {loanRequest.equifaxChecked ? (
                <CheckCircle2 className='h-5 w-5 text-green-500' />
              ) : (
                <Circle className='h-5 w-5 text-gray-300' />
              )}
              <span className='text-sm font-medium'>Consulta de Equifax</span>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                loanRequest.equifaxChecked
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {loanRequest.equifaxChecked ? 'Completado' : 'Pendiente'}
            </span>
          </div>

          {/* Bantotal Check */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {loanRequest.bantotalChecked ? (
                <CheckCircle2 className='h-5 w-5 text-green-500' />
              ) : !loanRequest.equifaxChecked ? (
                <Circle className='h-5 w-5 text-gray-300' />
              ) : (
                <Circle className='h-5 w-5 text-primary' />
              )}
              <span className='text-sm font-medium'>Revisión en Bantotal</span>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                loanRequest.bantotalChecked
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : !loanRequest.equifaxChecked
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    : 'bg-primary/10 text-primary-foreground dark:bg-primary/20 dark:text-primary-foreground'
              }`}
            >
              {loanRequest.bantotalChecked
                ? 'Completado'
                : !loanRequest.equifaxChecked
                  ? 'Bloqueado'
                  : 'Disponible'}
            </span>
          </div>

          {/* Loan Calculation */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {loanRequest.financingCalculated ? (
                <CheckCircle2 className='h-5 w-5 text-green-500' />
              ) : !loanRequest.bantotalChecked ? (
                <Circle className='h-5 w-5 text-gray-300' />
              ) : (
                <Circle className='h-5 w-5 text-primary' />
              )}
              <span className='text-sm font-medium'>Cálculo de préstamo</span>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                loanRequest.financingCalculated
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : !loanRequest.bantotalChecked
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    : 'bg-primary/10 text-primary-foreground dark:bg-primary/20 dark:text-primary-foreground'
              }`}
            >
              {loanRequest.financingCalculated
                ? 'Completado'
                : !loanRequest.bantotalChecked
                  ? 'Bloqueado'
                  : 'Disponible'}
            </span>
          </div>
        </div>

        {/* Mensaje de estado */}
        {progress === 100 ? (
          <div className='mt-2 rounded-md bg-green-50 p-2 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4' />
              <span>
                Verificaciones completadas. Puede aprobar o rechazar la
                solicitud.
              </span>
            </div>
          </div>
        ) : progress > 0 ? (
          <div className='mt-2 rounded-md bg-primary/10 p-2 text-sm text-foreground dark:bg-primary/20 dark:text-foreground'>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-4 w-4' />
              <span>Complete todas las verificaciones para continuar.</span>
            </div>
          </div>
        ) : (
          <div className='mt-2 rounded-md bg-gray-50 p-2 text-sm text-gray-800 dark:bg-gray-800/50 dark:text-gray-400'>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-4 w-4' />
              <span>Inicie el proceso consultando Equifax.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
