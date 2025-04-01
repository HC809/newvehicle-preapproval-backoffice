import { InfoItem } from '@/components/custom/info-item';
import { formatHNL } from '@/utils/formatCurrency';
import { LoanRequest } from 'types/LoanRequests';
import { DollarSign, Calendar, Percent } from 'lucide-react';

interface FinancialInfoTabProps {
  loanRequest: LoanRequest;
}

export const FinancialInfoTab = ({ loanRequest }: FinancialInfoTabProps) => {
  // Create a key that will change when relevant loan request data changes
  const dataKey = `${loanRequest.id}-${loanRequest.requestedAmount}-${loanRequest.vehicleInsuranceRate}-${loanRequest.appliedInterestRate}-${loanRequest.requestedLoanTermMonths}`;

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2' key={dataKey}>
      <InfoItem
        label='Monto Solicitado'
        value={formatHNL(loanRequest.requestedAmount)}
        icon={<DollarSign size={18} />}
        iconColor='text-emerald-500'
        textColor='text-emerald-700'
        darkTextColor='dark:text-emerald-300'
      />
      <InfoItem
        label='Plazo Máximo'
        value={`${loanRequest.requestedLoanTermMonths} meses`}
        icon={<Calendar size={18} />}
        iconColor='text-violet-500'
      />
      {loanRequest.approvedLoanTermMonths &&
        loanRequest.approvedLoanTermMonths > 0 && (
          <InfoItem
            label='Plazo Aprobado'
            value={`${loanRequest.approvedLoanTermMonths} meses`}
            icon={<Calendar size={18} />}
            iconColor='text-violet-500'
          />
        )}
      {/* <InfoItem
        label='Tipo de Cambio USD'
        value={`$${loanRequest.dollarExchangeRate.toFixed(2)}`}
        icon={<DollarSign size={18} />}
        iconColor='text-emerald-500'
        textColor='text-emerald-700'
        darkTextColor='dark:text-emerald-300'
      /> */}
      <InfoItem
        label='Tasa de Interés'
        value={`${loanRequest.appliedInterestRate}%`}
        icon={<Percent size={18} />}
        iconColor='text-violet-500'
      />
      <InfoItem
        label='Tasa de Seguro Vehículo'
        value={`${loanRequest.vehicleInsuranceRate}%`}
        icon={<Percent size={18} />}
        iconColor='text-violet-500'
      />
    </div>
  );
};
