import { InfoItem } from '@/components/custom/info-item';
import { Visit } from 'types/LoanRequests';
import { MapPin, Building, User, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface VisitInfoTabProps {
  visit: Visit;
  branchManagerComment?: string | null;
}

export const VisitInfoTab = ({
  visit,
  branchManagerComment
}: VisitInfoTabProps) => {
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

          {visit.pymeAdvisorName && (
            <InfoItem
              icon={<User className='h-4 w-4 text-purple-500' />}
              label='Asesor PYME'
              value={visit.pymeAdvisorName}
            />
          )}
        </div>
      </div>

      {/* Sección de comentario del gerente */}
      {branchManagerComment && (
        <div>
          <h3 className='mb-3 border-b pb-2 text-sm font-medium text-muted-foreground'>
            Comentario del Gerente
          </h3>
          <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20'>
            <div className='flex items-start gap-3'>
              <FileText className='mt-0.5 h-4 w-4 text-green-600 dark:text-green-400' />
              <p className='text-sm text-green-700 dark:text-green-300'>
                {branchManagerComment}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
