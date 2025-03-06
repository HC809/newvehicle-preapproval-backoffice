import { InfoItem } from '@/components/custom/info-item';
import { LoanRequest } from 'types/LoanRequests';
import { Car, Calendar, CornerDownRightIcon } from 'lucide-react';

interface VehicleInfoTabProps {
  loanRequest: LoanRequest;
}

export const VehicleInfoTab = ({ loanRequest }: VehicleInfoTabProps) => {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
      <InfoItem
        label='Tipo de Vehículo'
        value={loanRequest.vehicleTypeName}
        icon={<Car size={18} />}
        iconColor='text-violet-500'
      />
      <InfoItem
        label='Año'
        value={loanRequest.vehicleYear}
        icon={<Calendar size={18} />}
        iconColor='text-violet-500'
      />
      <InfoItem
        label='Marca'
        value={loanRequest.vehicleBrand}
        icon={<CornerDownRightIcon size={18} />}
        iconColor='text-violet-500'
      />
      <InfoItem
        label='Modelo'
        value={loanRequest.vehicleModel}
        icon={<CornerDownRightIcon size={18} />}
        iconColor='text-violet-500'
      />
    </div>
  );
};
