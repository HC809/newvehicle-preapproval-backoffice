import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  AlertCircle,
  Search,
  Calculator
} from 'lucide-react';
import { LoanRequest } from 'types/LoanRequests';

interface VerificationChecklistCardProps {
  loanRequest: LoanRequest;
  onCheckEquifax: () => void;
  onCheckBantotal: () => void;
  onCalculateLoan: () => void;
  isCheckingEquifax?: boolean;
  isCheckingBantotal?: boolean;
  isCalculatingLoan?: boolean;
}

export const VerificationChecklistCard = ({
  loanRequest,
  onCheckEquifax,
  onCheckBantotal,
  onCalculateLoan,
  isCheckingEquifax,
  isCheckingBantotal,
  isCalculatingLoan
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
            {loanRequest.equifaxChecked ? (
              <span className='rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400'>
                Completado
              </span>
            ) : (
              <Button
                variant='outline'
                size='sm'
                onClick={onCheckEquifax}
                disabled={isCheckingEquifax}
                className='gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/20'
              >
                {isCheckingEquifax ? (
                  'Consultando...'
                ) : (
                  <>
                    <Search className='h-4 w-4' />
                    Consultar
                  </>
                )}
              </Button>
            )}
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
            {loanRequest.bantotalChecked ? (
              <span className='rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400'>
                Completado
              </span>
            ) : !loanRequest.equifaxChecked ? (
              <span className='rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-400'>
                Bloqueado
              </span>
            ) : (
              <Button
                variant='outline'
                size='sm'
                onClick={onCheckBantotal}
                disabled={isCheckingBantotal}
                className='gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/20'
              >
                {isCheckingBantotal ? (
                  'Revisando...'
                ) : (
                  <>
                    <Search className='h-4 w-4' />
                    Revisar
                  </>
                )}
              </Button>
            )}
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
            {loanRequest.financingCalculated ? (
              <span className='rounded-full bg-green-100 px-2 py-1 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400'>
                Completado
              </span>
            ) : !loanRequest.bantotalChecked ? (
              <span className='rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-400'>
                Bloqueado
              </span>
            ) : (
              <Button
                variant='outline'
                size='sm'
                onClick={onCalculateLoan}
                disabled={isCalculatingLoan}
                className='gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/20'
              >
                {isCalculatingLoan ? (
                  'Calculando...'
                ) : (
                  <>
                    <Calculator className='h-4 w-4' />
                    Calcular
                  </>
                )}
              </Button>
            )}
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
