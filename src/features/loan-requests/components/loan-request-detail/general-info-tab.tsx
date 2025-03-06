import { InfoItem } from '@/components/custom/info-item';
import { formatHNL } from '@/utils/formatCurrency';
import { LoanRequest } from 'types/LoanRequests';
import { CreditCard, MapPin, Building, DollarSign, Copy } from 'lucide-react';
import { useState } from 'react';

interface GeneralInfoTabProps {
  loanRequest: LoanRequest;
}

export const GeneralInfoTab = ({ loanRequest }: GeneralInfoTabProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <InfoItem
        label='DNI Cliente'
        value={loanRequest.dni}
        icon={<CreditCard size={18} />}
        iconColor='text-violet-500'
        actionIcon={
          <button
            onClick={() => copyToClipboard(loanRequest.dni)}
            className='ml-3 rounded-md p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
            title='Copiar al portapapeles'
          >
            <Copy
              size={16}
              className={copied ? 'text-green-500' : 'text-gray-500'}
            />
          </button>
        }
        //iconColor='text-amber-500'
        // textColor='text-amber-700'
        // darkTextColor='dark:text-amber-300'
      />
      <InfoItem
        label='Ciudad'
        value={loanRequest.city}
        icon={<MapPin size={18} />}
        iconColor='text-violet-500'
        //iconColor='text-amber-500'
        // textColor='text-amber-700'
        // darkTextColor='dark:text-amber-300'
      />
      <InfoItem
        label='Concesionario'
        value={loanRequest.dealershipName}
        icon={<Building size={18} />}
        iconColor='text-blue-500'
        textColor='text-blue-700'
        darkTextColor='dark:text-blue-300'
      />
      {/* <InfoItem
                label='Gerente Asignado'
                value={loanRequest.managerName}
                icon={<UserCog size={18} />}
                iconColor='text-purple-500'
                textColor='text-purple-700'
                darkTextColor='dark:text-purple-300'
            /> */}
      <InfoItem
        label='Ingreso Mensual del Cliente'
        value={formatHNL(loanRequest.monthlyIncome)}
        icon={<DollarSign size={18} />}
        iconColor='text-emerald-500'
        textColor='text-emerald-700'
        darkTextColor='dark:text-emerald-300'
      />
    </div>
  );
};
