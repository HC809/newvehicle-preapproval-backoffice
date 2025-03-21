import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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
    <Card className='border-l-4 border-l-emerald-500 dark:border-l-emerald-400'>
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
            <span>Editar</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid gap-2 pt-4'>
          <div className='flex items-center justify-between rounded-lg bg-muted/30 p-3'>
            <span className='text-sm text-muted-foreground'>
              Monto solicitado
            </span>
            <span className='font-medium text-emerald-700 dark:text-emerald-300'>
              {formatHNL(loanRequest.requestedAmount)}
            </span>
          </div>
          <div className='flex items-center justify-between rounded-lg p-3'>
            <span className='text-sm text-muted-foreground'>Plazo Máximo</span>
            <span className='font-medium'>
              {loanRequest.requestedLoanTermMonths} meses
            </span>
          </div>
          <div className='flex items-center justify-between rounded-lg bg-muted/30 p-3'>
            <span className='text-sm text-muted-foreground'>
              Tasa de interés
            </span>
            <span className='font-medium'>
              {loanRequest.appliedInterestRate}%
            </span>
          </div>
        </div>

        <Separator />

        <div className='rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Cuota mensual total</span>
            <span className='font-bold text-emerald-700 dark:text-emerald-300'>
              {loanCalculation
                ? formatHNL(loanCalculation.totalMonthlyPayment)
                : 'Pendiente de cálculo'}
            </span>
          </div>
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
            <DialogContent className='max-h-[90vh] sm:max-w-[900px]'>
              <DialogHeader className='relative pb-2'>
                <DialogTitle className='text-xl'>
                  Desglose del Cálculo Financiero
                </DialogTitle>
                <DialogClose className='absolute right-0 top-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'>
                  <span className='sr-only'>Cerrar</span>
                </DialogClose>
              </DialogHeader>
              <ScrollArea className='h-full max-h-[calc(90vh-80px)] pr-4'>
                <div className='relative grid gap-8 py-4 sm:grid-cols-2 lg:grid-cols-3'>
                  {/* Columna 1 - Información del Préstamo */}
                  <div className='relative space-y-4'>
                    <h3 className='flex items-center gap-2 font-semibold'>
                      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'>
                        1
                      </div>
                      <span>Información del Préstamo</span>
                    </h3>
                    <div className='space-y-3'>
                      <FinancialItem
                        label='Valor de la garantía'
                        value={formatHNL(loanCalculation.totalVehicleValue)}
                      />
                      <FinancialItem
                        label='Crédito solicitado'
                        value={formatHNL(loanCalculation.requestedLoanAmount)}
                        highlight='amber'
                      />
                      <FinancialItem
                        label='Valor de la prima'
                        value={formatHNL(loanCalculation.downPaymentValue)}
                      />
                      <FinancialItem
                        label='Porcentaje de prima'
                        value={`${loanCalculation.downPaymentPercentage.toFixed(2)}%`}
                      />
                      <FinancialItem
                        label='Capacidad máxima de pago'
                        value={formatHNL(
                          loanCalculation.maximumPaymentCapacity
                        )}
                      />
                    </div>
                    {/* Separador Vertical 1 */}
                    <div className='absolute -right-4 top-0 hidden h-full sm:block lg:block'>
                      <Separator orientation='vertical' className='h-full' />
                    </div>
                  </div>

                  {/* Columna 2 - Pagos Mensuales */}
                  <div className='relative space-y-4'>
                    <h3 className='flex items-center gap-2 font-semibold'>
                      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'>
                        2
                      </div>
                      <span>Pagos Mensuales</span>
                    </h3>
                    <div className='space-y-3'>
                      <FinancialItem
                        label='Cuota mensual (capital + intereses)'
                        value={formatHNL(loanCalculation.monthlyPayment)}
                      />
                      <FinancialItem
                        label='Seguro de vida y accidentes'
                        value={formatHNL(
                          loanCalculation.lifeAndAccidentInsurance
                        )}
                      />
                      <FinancialItem
                        label='Seguro del vehículo'
                        value={formatHNL(loanCalculation.vehicleInsurance)}
                      />
                      <FinancialItem
                        label='Valor de GPS'
                        value={formatHNL(loanCalculation.monthlyGpsFee)}
                      />
                      <FinancialItem
                        label='Cuota mensual total'
                        value={formatHNL(loanCalculation.totalMonthlyPayment)}
                        highlight='emerald'
                      />
                    </div>
                    {/* Separador Vertical 2 */}
                    <div className='absolute -right-4 top-0 hidden h-full lg:block'>
                      <Separator orientation='vertical' className='h-full' />
                    </div>
                  </div>

                  {/* Columna 3 - Información Adicional */}
                  <div className='space-y-4'>
                    <h3 className='flex items-center gap-2 font-semibold'>
                      <div className='flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'>
                        3
                      </div>
                      <span>Información Adicional</span>
                    </h3>
                    <div className='space-y-3'>
                      <FinancialItem
                        label='Relación crédito/garantía'
                        value={`${(loanCalculation.loanToValueRatio * 100).toFixed(2)}%`}
                      />
                      <FinancialItem
                        label='Ingresos estimados mensuales'
                        value={formatHNL(loanRequest.monthlyIncome || 0)}
                      />
                      <FinancialItem
                        label='Scoring de Riesgo'
                        value={String(client?.lastRiskScore || 'No disponible')}
                        highlight='blue'
                      />
                      <FinancialItem
                        label='Relación cuota/ingreso'
                        value={`${(loanCalculation.paymentToIncomePercentage * 100).toFixed(2)}%`}
                        highlight='red'
                      />
                      <FinancialItem
                        label='Gastos de cierre'
                        value={formatHNL(loanCalculation.closingCosts)}
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

interface FinancialItemProps {
  label: string;
  value: string | number;
  highlight?: 'emerald' | 'amber' | 'red' | 'blue';
}

const FinancialItem = ({ label, value, highlight }: FinancialItemProps) => {
  const getHighlightClasses = () => {
    switch (highlight) {
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300';
      case 'red':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300';
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300';
      default:
        return '';
    }
  };

  return (
    <div
      className={`flex flex-col space-y-1 rounded-md ${
        highlight ? getHighlightClasses() + ' p-3' : ''
      }`}
    >
      <span className={`text-sm ${highlight ? '' : 'text-muted-foreground'}`}>
        {label}
      </span>
      <span
        className={`text-right font-medium tabular-nums ${highlight ? 'font-semibold' : ''}`}
      >
        {value}
      </span>
    </div>
  );
};
