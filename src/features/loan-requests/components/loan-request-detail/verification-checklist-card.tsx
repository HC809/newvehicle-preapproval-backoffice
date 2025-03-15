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
    loanRequest.bantotalChecked
  ].filter(Boolean).length;

  const totalSteps = 2;
  const progress = Math.round((stepsCompleted / totalSteps) * 100);

  return (
    <Card className='border-l-4 border-l-blue-500 dark:border-l-blue-400'>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <ClipboardCheck className='h-5 w-5 text-blue-500 dark:text-blue-400' />
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
              className='h-2 rounded-full bg-blue-500 transition-all duration-300 ease-in-out dark:bg-blue-400'
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className='space-y-3'>
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

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              {loanRequest.bantotalChecked ? (
                <CheckCircle2 className='h-5 w-5 text-green-500' />
              ) : loanRequest.equifaxChecked ? (
                <Circle className='h-5 w-5 text-blue-500' />
              ) : (
                <Circle className='h-5 w-5 text-gray-300' />
              )}
              <span className='text-sm font-medium'>Cálculo de préstamo</span>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                loanRequest.bantotalChecked
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : !loanRequest.equifaxChecked
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              }`}
            >
              {loanRequest.bantotalChecked
                ? 'Completado'
                : !loanRequest.equifaxChecked
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
          <div className='mt-2 rounded-md bg-blue-50 p-2 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'>
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
