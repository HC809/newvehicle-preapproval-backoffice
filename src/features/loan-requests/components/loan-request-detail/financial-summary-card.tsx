import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatHNL } from '@/utils/formatCurrency';
import { DollarSign } from 'lucide-react';
import { LoanRequest } from 'types/LoanRequests';

interface FinancialSummaryCardProps {
  loanRequest: LoanRequest;
}

export const FinancialSummaryCard = ({
  loanRequest
}: FinancialSummaryCardProps) => {
  // Cálculo de la cuota estimada
  const estimatedPayment =
    (loanRequest.requestedAmount *
      (1 + loanRequest.appliedInterestRate / 100)) /
    loanRequest.approvedLoanTermMonths;

  return (
    <Card className='border-t-4 border-t-emerald-500 dark:border-t-emerald-400'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <DollarSign className='h-5 w-5 text-emerald-500 dark:text-emerald-400' />
          <span>Resumen Financiero</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-muted-foreground'>
            Monto solicitado
          </span>
          <span className='font-medium text-emerald-700 dark:text-emerald-300'>
            {formatHNL(loanRequest.requestedAmount)}
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-muted-foreground'>Plazo Máximo</span>
          <span className='font-medium'>
            {loanRequest.requestedLoanTermMonths} meses
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-muted-foreground'>Tasa de interés</span>
          <span className='font-medium'>
            {loanRequest.appliedInterestRate}%
          </span>
        </div>
        <Separator />
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>Cuota estimada</span>
          <span className='font-bold text-emerald-700 dark:text-emerald-300'>
            {formatHNL(estimatedPayment)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
