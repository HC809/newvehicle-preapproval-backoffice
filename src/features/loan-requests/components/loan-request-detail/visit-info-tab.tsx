import { Visit } from 'types/LoanRequests';
import { MapPin, Building, User, Calendar } from 'lucide-react';

interface VisitInfoTabProps {
  visit: Visit;
}

export const VisitInfoTab = ({ visit }: VisitInfoTabProps) => {
  return (
    <div className='space-y-4'>
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Información de la sucursal */}
        <div className='space-y-3'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Información de la Sucursal
          </h3>
          <div className='space-y-2'>
            <div className='flex items-start'>
              <Building className='mr-2 mt-0.5 h-4 w-4 text-primary' />
              <div>
                <p className='text-sm font-medium'>Nombre de la Sucursal</p>
                <p className='text-sm text-muted-foreground'>
                  {visit.branchName || 'No especificado'}
                </p>
              </div>
            </div>
            <div className='flex items-start'>
              <MapPin className='mr-2 mt-0.5 h-4 w-4 text-primary' />
              <div>
                <p className='text-sm font-medium'>Dirección</p>
                <p className='text-sm text-muted-foreground'>
                  {visit.branchAddress || 'No especificada'}
                </p>
              </div>
            </div>
            <div className='flex items-start'>
              <Calendar className='mr-2 mt-0.5 h-4 w-4 text-primary' />
              <div>
                <p className='text-sm font-medium'>Código de Sucursal</p>
                <p className='text-sm text-muted-foreground'>
                  {visit.branchCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de los responsables */}
        <div className='space-y-3'>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Responsables
          </h3>
          <div className='space-y-2'>
            <div className='flex items-start'>
              <User className='mr-2 mt-0.5 h-4 w-4 text-primary' />
              <div>
                <p className='text-sm font-medium'>Gerente de Agencia</p>
                <p className='text-sm text-muted-foreground'>
                  {visit.branchManagerName || 'No asignado'}
                </p>
              </div>
            </div>
            <div className='flex items-start'>
              <User className='mr-2 mt-0.5 h-4 w-4 text-primary' />
              <div>
                <p className='text-sm font-medium'>Asesor PYME</p>
                <p className='text-sm text-muted-foreground'>
                  {visit.pymeAdvisorName || 'No asignado'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
