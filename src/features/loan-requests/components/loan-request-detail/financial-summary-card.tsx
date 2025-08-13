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
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatHNL } from '@/utils/formatCurrency';
import { DollarSign, Calculator } from 'lucide-react';
import { LoanRequest } from 'types/LoanRequests';
import { LoanCalculation } from 'types/LoanCalculation';
import { Client } from 'types/Client';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

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
  // Create a key that will change when relevant loan request data changes
  const dataKey = `${loanRequest.id}-${loanRequest.requestedAmount}-${loanRequest.vehicleInsuranceRate}-${loanRequest.appliedInterestRate}-${loanRequest.requestedLoanTermMonths}`;

  const imageRef = useRef<HTMLDivElement>(null);

  const handleCopyImage = async () => {
    if (!imageRef.current) return;

    try {
      // Asegurar que la imagen esté completamente cargada
      const logoImg = imageRef.current.querySelector('img');
      if (logoImg) {
        await new Promise((resolve, reject) => {
          if (logoImg.complete) {
            resolve(true);
          } else {
            logoImg.onload = resolve;
            logoImg.onerror = reject;
          }
        });
      }

      const canvas = await html2canvas(imageRef.current, {
        backgroundColor: '#fff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new window.ClipboardItem({ 'image/png': blob })
          ]);
          alert('Imagen copiada al portapapeles');
        } catch (err) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'resumen-financiero.png';
          link.click();
          URL.revokeObjectURL(url);
          alert('No se pudo copiar, pero la imagen fue descargada.');
        }
      });
    } catch (error) {
      alert('Error al generar la imagen. Intente nuevamente.');
    }
  };

  return (
    <Card
      className='border-l-4 border-l-emerald-500 dark:border-l-emerald-400'
      key={dataKey}
    >
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <DollarSign className='h-5 w-5 text-emerald-500 dark:text-emerald-400' />
          <span>Resumen Financiero</span>
        </CardTitle>
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
            <span className='text-sm text-muted-foreground'>
              {loanRequest.approvedLoanTermMonths &&
              loanRequest.approvedLoanTermMonths > 0
                ? 'Plazo Aprobado'
                : 'Plazo Máximo'}
            </span>
            <span className='font-medium'>
              {loanRequest.approvedLoanTermMonths &&
              loanRequest.approvedLoanTermMonths > 0
                ? `${loanRequest.approvedLoanTermMonths} meses`
                : `${loanRequest.requestedLoanTermMonths} meses`}
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
            <DialogContent className='max-h-[90vh] sm:max-w-[900px] [&>button]:outline-none [&>button]:ring-0 [&>button]:focus:ring-0 [&>button]:focus-visible:ring-0'>
              <DialogHeader className='relative pb-2'>
                <DialogTitle className='text-xl'>
                  Desglose del Cálculo Financiero
                </DialogTitle>
                <Button
                  variant='secondary'
                  size='sm'
                  className='absolute right-0 top-0 z-10 mr-12 mt-2'
                  onClick={handleCopyImage}
                >
                  Copiar imagen
                </Button>
              </DialogHeader>
              {loanCalculation && (
                <div
                  ref={imageRef}
                  style={{ position: 'absolute', left: '-9999px', top: 0 }}
                >
                  <FinancialSummaryImage
                    clientName={client?.name || loanRequest.clientName || ''}
                    loanCalculation={loanCalculation}
                    loanRequest={loanRequest}
                    riskScore={client?.lastRiskScore || 'No disponible'}
                  />
                </div>
              )}
              <ScrollArea className='h-full max-h-[calc(90vh-80px)] pr-4'>
                <div className='relative grid gap-12 bg-background py-6 sm:grid-cols-2 lg:grid-cols-3'>
                  {/* Columna 1 - Información del Préstamo */}
                  <div className='relative space-y-8'>
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-foreground'>
                      <div className='flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'>
                        1
                      </div>
                      <span>Información del Préstamo</span>
                    </h3>
                    <div className='space-y-4'>
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
                      <Separator
                        orientation='vertical'
                        className='h-full bg-border'
                      />
                    </div>
                  </div>

                  {/* Columna 2 - Pagos Mensuales */}
                  <div className='relative space-y-8'>
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-foreground'>
                      <div className='flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'>
                        2
                      </div>
                      <span>Pagos Mensuales</span>
                    </h3>
                    <div className='space-y-4'>
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
                        label='Impuesto del seguro de vehículo'
                        value={formatHNL(loanCalculation.vehicleInsuranceTax)}
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
                      <Separator
                        orientation='vertical'
                        className='h-full bg-border'
                      />
                    </div>
                  </div>

                  {/* Columna 3 - Información Adicional */}
                  <div className='relative space-y-8'>
                    <h3 className='flex items-center gap-2 text-lg font-semibold text-foreground'>
                      <div className='flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'>
                        3
                      </div>
                      <span>Información Adicional</span>
                    </h3>
                    <div className='space-y-4'>
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
        return 'text-emerald-700 dark:text-emerald-300';
      case 'amber':
        return 'text-amber-700 dark:text-amber-300';
      case 'red':
        return 'text-red-700 dark:text-red-300';
      case 'blue':
        return 'text-blue-700 dark:text-blue-300';
      default:
        return '';
    }
  };

  return (
    <div className='flex flex-col space-y-2 py-1'>
      <span
        className={`text-sm ${highlight ? getHighlightClasses() : 'text-muted-foreground'}`}
      >
        {label}
      </span>
      <span
        className={`text-right text-base font-medium tabular-nums ${highlight ? getHighlightClasses() + ' font-semibold' : 'text-foreground'}`}
      >
        {value}
      </span>
    </div>
  );
};

// Componente para la imagen con formato tipo tarjeta resumen
const FinancialSummaryImage = ({
  clientName,
  loanCalculation,
  loanRequest,
  riskScore
}: {
  clientName: string;
  loanCalculation: LoanCalculation;
  loanRequest: LoanRequest;
  riskScore: string | number;
}) => (
  <div
    style={{
      width: 500,
      fontFamily: 'Arial, sans-serif',
      background: '#fff',
      color: '#222',
      border: '2px solid #0a3970',
      borderRadius: 12,
      padding: 24
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src='/images/logo.png'
        alt='Logo Cofisa'
        width={320}
        height={60}
        style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
        crossOrigin='anonymous'
      />
    </div>
    <div
      style={{
        background: '#FFD600',
        color: '#0a3970',
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 20,
        letterSpacing: 1,
        marginBottom: 6
      }}
    >
      CÁLCULO DE CUOTA MENSUAL
    </div>
    <div
      style={{
        background: '#0a3970',
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 17,
        letterSpacing: 1,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 6,
        marginBottom: 16
      }}
    >
      {clientName}
    </div>
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 15,
        marginTop: 8
      }}
    >
      <tbody>
        <tr style={{ borderBottom: '1px solid #b0b0b0' }}>
          <td style={{ fontWeight: 'bold', padding: 6 }}>Valor Vehículo</td>
          <td style={{ textAlign: 'right', padding: 6 }}>
            L{' '}
            {formatHNL(loanCalculation.totalVehicleValue).replace(/^L\s*/, '')}
          </td>
        </tr>
        <tr style={{ borderBottom: '1px solid #b0b0b0' }}>
          <td style={{ fontWeight: 'bold', padding: 6 }}>Plazo</td>
          <td style={{ textAlign: 'right', padding: 6 }}>
            {loanRequest.approvedLoanTermMonths &&
            loanRequest.approvedLoanTermMonths > 0 &&
            loanRequest.approvedLoanTermMonths !==
              loanRequest.requestedLoanTermMonths
              ? loanRequest.approvedLoanTermMonths
              : loanRequest.requestedLoanTermMonths}{' '}
            Meses
          </td>
        </tr>
        <tr style={{ borderBottom: '1px solid #b0b0b0' }}>
          <td style={{ fontWeight: 'bold', padding: 6 }}>Prima</td>
          <td style={{ textAlign: 'right', padding: 6 }}>
            L {formatHNL(loanCalculation.downPaymentValue).replace(/^L\s*/, '')}
          </td>
        </tr>
        <tr style={{ borderBottom: '1px solid #b0b0b0' }}>
          <td style={{ fontWeight: 'bold', padding: 6 }}>
            Porcentaje de la prima
          </td>
          <td style={{ textAlign: 'right', padding: 6 }}>
            {loanCalculation.downPaymentPercentage.toFixed(2)}%
          </td>
        </tr>
        <tr style={{ borderBottom: '1px solid #b0b0b0' }}>
          <td style={{ fontWeight: 'bold', padding: 6 }}>
            Tasa de interés (anual)
          </td>
          <td style={{ textAlign: 'right', padding: 6 }}>
            {loanRequest.appliedInterestRate}%
          </td>
        </tr>
        <tr style={{ borderBottom: '1px solid #b0b0b0' }}>
          <td style={{ fontWeight: 'bold', padding: 6 }}>Monto a financiar</td>
          <td style={{ textAlign: 'right', padding: 6 }}>
            L{' '}
            {formatHNL(loanCalculation.requestedLoanAmount).replace(
              /^L\s*/,
              ''
            )}
          </td>
        </tr>
        <tr style={{ borderBottom: '1px solid #b0b0b0' }}>
          <td style={{ fontWeight: 'bold', padding: 6 }}>
            Cuota mensual (Capital + Interés)
          </td>
          <td style={{ textAlign: 'right', padding: 6 }}>
            L {formatHNL(loanCalculation.monthlyPayment).replace(/^L\s*/, '')}
          </td>
        </tr>
        <tr style={{ borderBottom: '1px solid #b0b0b0' }}>
          <td style={{ fontWeight: 'bold', padding: 6 }}>Seguro vida</td>
          <td style={{ textAlign: 'right', padding: 6 }}>
            L{' '}
            {formatHNL(loanCalculation.lifeAndAccidentInsurance).replace(
              /^L\s*/,
              ''
            )}
          </td>
        </tr>
        <tr style={{ borderBottom: '1px solid #b0b0b0' }}>
          <td style={{ fontWeight: 'bold', padding: 6 }}>
            Seguro daños y robo
          </td>
          <td style={{ textAlign: 'right', padding: 6 }}>
            L {formatHNL(loanCalculation.vehicleInsurance).replace(/^L\s*/, '')}
          </td>
        </tr>
        <tr style={{ borderBottom: '1px solid #b0b0b0' }}>
          <td style={{ fontWeight: 'bold', padding: 6 }}>Cobertura GPS</td>
          <td style={{ textAlign: 'right', padding: 6 }}>
            L {formatHNL(loanCalculation.monthlyGpsFee).replace(/^L\s*/, '')}
          </td>
        </tr>
        <tr style={{ borderBottom: '1px solid #b0b0b0' }}>
          <td style={{ fontWeight: 'bold', padding: 6 }}>
            Cuota total mensual
          </td>
          <td style={{ textAlign: 'right', padding: 6 }}>
            L{' '}
            {formatHNL(loanCalculation.totalMonthlyPayment).replace(
              /^L\s*/,
              ''
            )}
          </td>
        </tr>
        <tr>
          <td style={{ fontWeight: 'bold', padding: 6 }}>Scoring de riesgo</td>
          <td style={{ textAlign: 'right', padding: 6 }}>{riskScore}</td>
        </tr>
      </tbody>
    </table>
  </div>
);
