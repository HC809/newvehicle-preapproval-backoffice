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
import { Client } from 'types/Client';

interface FinancialSummaryCardProps {
  loanRequest: LoanRequest;
  loanCalculation?: LoanCalculation;
  client?: Client;
}

export const FinancialSummaryCard = ({
  loanRequest,
  loanCalculation,
  client
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
            <DialogContent className='sm:max-w-[900px]'>
              <DialogHeader>
                <DialogTitle>Desglose del Cálculo Financiero</DialogTitle>
              </DialogHeader>
              <div className='grid grid-cols-3 gap-8 pt-4'>
                {/* Columna 1 */}
                <div className='space-y-3'>
                  <div className='flex flex-col space-y-1'>
                    <span className='text-sm text-muted-foreground'>
                      Valor de la garantía
                    </span>
                    <span className='text-right font-medium tabular-nums'>
                      {formatHNL(loanCalculation.totalVehicleValue)}
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1 rounded-md bg-amber-50 p-2 dark:bg-amber-900/20'>
                    <span className='text-sm text-amber-700 dark:text-amber-300'>
                      Crédito solicitado
                    </span>
                    <span className='text-right font-medium tabular-nums text-amber-700 dark:text-amber-300'>
                      {formatHNL(loanCalculation.requestedLoanAmount)}
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1'>
                    <span className='text-sm text-muted-foreground'>
                      Valor de la prima
                    </span>
                    <span className='text-right font-medium tabular-nums'>
                      {formatHNL(loanCalculation.downPaymentValue)}
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1'>
                    <span className='text-sm text-muted-foreground'>
                      Porcentaje de prima
                    </span>
                    <span className='text-right font-medium tabular-nums'>
                      {loanCalculation.downPaymentPercentage.toFixed(2)}%
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1'>
                    <span className='text-sm text-muted-foreground'>
                      Capacidad máxima de pago
                    </span>
                    <span className='text-right font-medium tabular-nums'>
                      {formatHNL(loanCalculation.maximumPaymentCapacity)}
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1'>
                    <span className='text-sm text-muted-foreground'>
                      Relación crédito/garantía
                    </span>
                    <span className='text-right font-medium tabular-nums'>
                      {(loanCalculation.loanToValueRatio * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1'>
                    <span className='text-sm text-muted-foreground'>
                      Ingresos estimados mensuales
                    </span>
                    <span className='text-right font-medium tabular-nums'>
                      {formatHNL(loanRequest.monthlyIncome || 0)}
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1 rounded-md bg-blue-50 p-2 dark:bg-blue-900/20'>
                    <span className='text-sm text-blue-700 dark:text-blue-300'>
                      Scoring de Riesgo
                    </span>
                    <span className='text-right font-medium tabular-nums text-blue-700 dark:text-blue-300'>
                      {client?.lastRiskScore || 'No disponible'}
                    </span>
                  </div>
                </div>

                {/* Columna 2 */}
                <div className='space-y-3'>
                  <div className='flex flex-col space-y-1'>
                    <span className='text-sm text-muted-foreground'>
                      Plazo en meses
                    </span>
                    <span className='text-right font-medium tabular-nums'>
                      {loanRequest.requestedLoanTermMonths}
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1'>
                    <span className='text-sm text-muted-foreground'>
                      Tasa de interés anual
                    </span>
                    <span className='text-right font-medium tabular-nums'>
                      {loanCalculation.interestRate.toFixed(2)}%
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1'>
                    <span className='text-sm text-muted-foreground'>
                      Cuota mensual (capital + intereses)
                    </span>
                    <span className='text-right font-medium tabular-nums'>
                      {formatHNL(loanCalculation.monthlyPayment)}
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1'>
                    <span className='text-sm text-muted-foreground'>
                      Seguro de vida y accidentes personales
                    </span>
                    <span className='text-right font-medium tabular-nums'>
                      {formatHNL(loanCalculation.lifeAndAccidentInsurance)}
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1'>
                    <span className='text-sm text-muted-foreground'>
                      Seguro del vehículo
                    </span>
                    <span className='text-right font-medium tabular-nums'>
                      {formatHNL(loanCalculation.vehicleInsurance)}
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1 rounded-md bg-emerald-50 p-2 dark:bg-emerald-900/20'>
                    <span className='text-sm font-medium text-emerald-700 dark:text-emerald-300'>
                      Cuota mensual total
                    </span>
                    <span className='text-right font-bold tabular-nums text-emerald-700 dark:text-emerald-300'>
                      {formatHNL(loanCalculation.totalMonthlyPayment)}
                    </span>
                  </div>
                </div>

                {/* Columna 3 */}
                <div className='space-y-3'>
                  <div className='flex flex-col space-y-1 rounded-md bg-red-50 p-2 dark:bg-red-900/20'>
                    <span className='text-sm text-red-700 dark:text-red-300'>
                      Ratio cuota/ingreso
                    </span>
                    <span className='text-right font-medium tabular-nums text-red-700 dark:text-red-300'>
                      {(
                        loanCalculation.paymentToIncomePercentage * 100
                      ).toFixed(2)}
                      %
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1'>
                    <span className='text-sm text-muted-foreground'>
                      Gastos de cierre
                    </span>
                    <span className='text-right font-medium tabular-nums'>
                      {formatHNL(loanCalculation.closingCosts)}
                    </span>
                  </div>
                  <div className='flex flex-col space-y-1'>
                    <span className='text-sm text-muted-foreground'>
                      Impuesto seguro vehículo
                    </span>
                    <span className='text-right font-medium tabular-nums'>
                      {formatHNL(loanCalculation.vehicleInsuranceTax)}
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
