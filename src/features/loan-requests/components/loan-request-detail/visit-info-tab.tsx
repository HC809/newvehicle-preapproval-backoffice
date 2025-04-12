import { InfoItem } from '@/components/custom/info-item';
import { Visit } from 'types/LoanRequests';
import { MapPin, Building, User } from 'lucide-react';

interface VisitInfoTabProps {
  visit: Visit;
}

export const VisitInfoTab = ({ visit }: VisitInfoTabProps) => {
  return (
    <div className='space-y-6'>
      {/* Sección de sucursal */}
      <div>
        <h3 className='mb-3 border-b pb-2 text-sm font-medium text-muted-foreground'>
          Información de la Sucursal
        </h3>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <InfoItem
            icon={<Building className='h-4 w-4 text-indigo-500' />}
            label='Nombre de la Sucursal'
            value={visit.branchName || 'No especificado'}
          />

          <InfoItem
            icon={<MapPin className='h-4 w-4 text-indigo-500' />}
            label='Dirección'
            value={visit.branchAddress || 'No especificada'}
          />
        </div>
      </div>

      {/* Sección de responsables */}
      <div>
        <h3 className='mb-3 border-b pb-2 text-sm font-medium text-muted-foreground'>
          Responsables
        </h3>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <InfoItem
            icon={<User className='h-4 w-4 text-purple-500' />}
            label='Gerente de Agencia'
            value={visit.branchManagerName || 'No asignado'}
          />

          <InfoItem
            icon={<User className='h-4 w-4 text-purple-500' />}
            label='Asesor PYME'
            value={visit.pymeAdvisorName || 'No asignado'}
          />
        </div>
      </div>
    </div>
  );
};
