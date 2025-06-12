import { InfoItem } from '@/components/custom/info-item';
import { formatHNL } from '@/utils/formatCurrency';
import { LoanRequest } from 'types/LoanRequests';
import {
  CreditCard,
  MapPin,
  Building,
  DollarSign,
  Copy,
  User,
  Star,
  UserCircle
} from 'lucide-react';
import { useState } from 'react';
import { Client } from 'types/Client';
import { translateIncomeType } from '@/utils/translateIncomeType';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface GeneralInfoTabProps {
  loanRequest: LoanRequest;
  client?: Client;
}

export const GeneralInfoTab = ({
  loanRequest,
  client
}: GeneralInfoTabProps) => {
  const router = useRouter();
  const [copiedDNI, setCopiedDNI] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const copyDNI = () => {
    navigator.clipboard.writeText(loanRequest.dni);
    setCopiedDNI(true);
    setTimeout(() => setCopiedDNI(false), 2000);
  };

  const copyPhone = (phoneNumber: string) => {
    navigator.clipboard.writeText(phoneNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    // Format as XXXX-XXXX
    return cleaned.replace(/(\d{4})(\d{4})/, '$1-$2');
  };

  const handleViewClientProfile = () => {
    if (client?.id) {
      router.push(`/dashboard/clients/${client.id}`);
    }
  };

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <InfoItem
        icon={<CreditCard className='h-4 w-4 text-purple-500' />}
        label='DNI'
        value={
          <div className='flex items-center gap-2'>
            <span>{loanRequest.dni}</span>
            <button
              onClick={copyDNI}
              className='rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800'
              title='Copiar DNI'
            >
              <Copy className='h-3 w-3 text-gray-500' />
            </button>
            {copiedDNI && (
              <span className='text-xs text-green-500'>¡Copiado!</span>
            )}
          </div>
        }
      />

      {client && (
        <InfoItem
          icon={<User className='h-4 w-4 text-purple-500' />}
          label='Nombre del Cliente'
          value={
            <div className='flex items-center gap-2'>
              <span>{client.name}</span>
              {loanRequest.isExistingClient && client.id && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6'
                  onClick={handleViewClientProfile}
                  title='Ver perfil del cliente'
                >
                  <UserCircle className='h-4 w-4 text-blue-500' />
                </Button>
              )}
            </div>
          }
        />
      )}

      <InfoItem
        icon={<MapPin className='h-4 w-4 text-purple-500' />}
        label='Ciudad'
        value={loanRequest.city}
      />

      <InfoItem
        icon={<Building className='h-4 w-4 text-blue-500' />}
        label='Concesionaria'
        value={loanRequest.dealershipName}
      />

      {loanRequest.monthlyIncome && (
        <InfoItem
          icon={<DollarSign className='h-4 w-4 text-green-500' />}
          label='Ingreso Mensual'
          value={formatHNL(loanRequest.monthlyIncome)}
        />
      )}

      {loanRequest.incomeType && (
        <InfoItem
          icon={<DollarSign className='h-4 w-4 text-green-500' />}
          label='Tipo de Ingreso'
          value={translateIncomeType(loanRequest.incomeType)}
        />
      )}

      {client && client.lastRiskScore !== undefined && (
        <InfoItem
          icon={<Star className='h-4 w-4 text-yellow-500' />}
          label='Scoring de Riesgo'
          value={
            <span
              className={`font-semibold ${getRiskScoreColor(client.lastRiskScore)}`}
            >
              {client.lastRiskScore}
            </span>
          }
        />
      )}

      {client && client.email && (
        <InfoItem
          icon={<span className='text-blue-500'>@</span>}
          label='Correo Electrónico'
          value={client.email}
        />
      )}

      {client && client.phoneNumber && (
        <InfoItem
          icon={<span className='text-green-500'>📞</span>}
          label='Teléfono'
          value={
            <div className='flex items-center gap-2'>
              <span>+504 {formatPhoneNumber(client.phoneNumber)}</span>
              <button
                onClick={() => copyPhone(client.phoneNumber)}
                className='rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800'
                title='Copiar teléfono'
              >
                <Copy className='h-3 w-3 text-gray-500' />
              </button>
              {copiedPhone && (
                <span className='text-xs text-green-500'>¡Copiado!</span>
              )}
            </div>
          }
        />
      )}

      {client && client.residentialAddress && (
        <InfoItem
          icon={<MapPin className='h-4 w-4 text-orange-500' />}
          label='Dirección'
          value={client.residentialAddress}
        />
      )}

      {/* <InfoItem
        icon={<span className='text-blue-500'>🔄</span>}
        label='Cliente Existente'
        value={loanRequest.isExistingClient ? 'Sí' : 'No'}
      /> */}
    </div>
  );
};

// Función para determinar el color del puntaje de riesgo
function getRiskScoreColor(score: number): string {
  if (score >= 700) return 'text-green-600';
  if (score >= 600) return 'text-yellow-600';
  if (score >= 500) return 'text-orange-600';
  return 'text-red-600';
}
