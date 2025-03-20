import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { formatHNL } from '@/utils/formatCurrency';
import { DollarSign, Edit, Calculator } from 'lucide-react';
import { LoanRequest } from 'types/LoanRequests';
import { LoanCalculation } from 'types/LoanCalculation';

interface FinancialSummaryCardProps {
  loanRequest: LoanRequest;
  loanCalculation?: LoanCalculation;
}

export const FinancialSummaryCard = ({
  loanRequest,
  loanCalculation
}: FinancialSummaryCardProps) => {
  return (
    <Card className='border-t-4 border-t-emerald-500 dark:border-t-emerald-400'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <DollarSign className='h-5 w-5 text-emerald-500 dark:text-emerald-400' />
          <span>Resumen Financiero</span>
        </CardTitle>
        {loanRequest.equifaxChecked && (
          <Button
            variant='outline'
            size='sm'
            className='h-8 gap-1'
            disabled={!loanRequest.equifaxChecked}
          >
            <Edit className='h-3.5 w-3.5' />
            <span>Editar Plazo</span>
          </Button>
        )}
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
          <span className='text-sm font-medium'>Cuota mensual total</span>
          <span className='font-bold text-emerald-700 dark:text-emerald-300'>
            {loanCalculation
              ? formatHNL(loanCalculation.totalMonthlyPayment)
              : 'Pendiente de cálculo'}
          </span>
        </div>

        {loanCalculation && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='mt-2 w-full gap-2 border-emerald-500/30 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-400/30 dark:text-emerald-400 dark:hover:bg-emerald-900/20'
              >
                <Calculator className='h-4 w-4' />
                Ver Desglose Completo
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[500px]'>
              <DialogHeader>
                <DialogTitle>Desglose del Cálculo Financiero</DialogTitle>
              </DialogHeader>
              <div className='space-y-4 pt-4'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Valor de la garantía
                    </span>
                    <span className='font-medium'>
                      {formatHNL(loanCalculation.totalVehicleValue)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Valor de la prima
                    </span>
                    <span className='font-medium'>
                      {formatHNL(loanCalculation.downPaymentValue)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Crédito solicitado
                    </span>
                    <span className='font-medium'>
                      {formatHNL(loanCalculation.requestedLoanAmount)}
                    </span>
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Capacidad máxima de pago
                    </span>
                    <span className='font-medium'>
                      {formatHNL(loanCalculation.maximumPaymentCapacity)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Relación crédito/garantía
                    </span>
                    <span className='font-medium'>
                      {loanCalculation.loanToValueRatio.toFixed(2)}%
                    </span>
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Cuota mensual (capital + intereses)
                    </span>
                    <span className='font-medium'>
                      {formatHNL(loanCalculation.monthlyPayment)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Seguro de vida y accidentes personales
                    </span>
                    <span className='font-medium'>
                      {formatHNL(loanCalculation.lifeAndAccidentInsurance)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Seguro del vehículo
                    </span>
                    <span className='font-medium'>
                      {formatHNL(loanCalculation.vehicleInsurance)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Impuesto seguro vehículo
                    </span>
                    <span className='font-medium'>
                      {formatHNL(loanCalculation.vehicleInsuranceTax)}
                    </span>
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>
                      Cuota mensual total
                    </span>
                    <span className='font-bold text-emerald-700 dark:text-emerald-300'>
                      {formatHNL(loanCalculation.totalMonthlyPayment)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Ratio cuota/ingreso
                    </span>
                    <span className='font-medium'>
                      {loanCalculation.paymentToIncomePercentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};
