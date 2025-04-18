import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  translateStatus,
  getStatusVariant,
  getStatusClassName
} from '@/utils/getStatusColor';
import { formatLoanRequestId } from '@/utils/formatId';
import { User, FileText, MapPin } from 'lucide-react';
import { LoanRequest, LoanRequestStatus, Visit } from 'types/LoanRequests';
import { GeneralInfoTab } from './general-info-tab';
import { VehicleInfoTab } from './vehicle-info-tab';
import { FinancialInfoTab } from './financial-info-tab';
import { VisitInfoTab } from './visit-info-tab';
import { Client } from 'types/Client';

interface MainInfoCardProps {
  loanRequest: LoanRequest;
  client?: Client;
  visit?: Visit;
}

export const MainInfoCard = ({
  loanRequest,
  client,
  visit
}: MainInfoCardProps) => {
  const showVisitTab =
    loanRequest.status === LoanRequestStatus.VisitAssigned && visit;

  // Si está en estado VisitAssigned, la pestaña de visita debería ser la predeterminada
  const defaultTab = showVisitTab ? 'visit' : 'general';

  return (
    <Card className='border-l-4 border-l-blue-500 dark:border-l-blue-400'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <div>
          <CardTitle className='text-xl'>
            Solicitud #{formatLoanRequestId(loanRequest.id)}
          </CardTitle>
          <CardDescription className='flex items-center gap-2'>
            <User className='h-4 w-4 text-green-500 dark:text-green-400' />
            <span className='text-green-700 dark:text-green-300'>
              Creada por {loanRequest.creatorName}
            </span>
          </CardDescription>
        </div>
        <Badge
          variant={getStatusVariant(loanRequest.status)}
          className={getStatusClassName(loanRequest.status)}
        >
          {translateStatus(loanRequest.status)}
        </Badge>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={defaultTab} className='w-full'>
          <TabsList
            className={`grid w-full ${showVisitTab ? 'grid-cols-4' : 'grid-cols-3'}`}
          >
            <TabsTrigger value='general'>General</TabsTrigger>
            <TabsTrigger value='vehicle'>Vehículo</TabsTrigger>
            <TabsTrigger value='financial'>Financiero</TabsTrigger>
            {showVisitTab && (
              <TabsTrigger value='visit' className='flex items-center gap-1'>
                <MapPin className='h-3.5 w-3.5' />
                Visita
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent
            value='general'
            className='mt-4 space-y-4 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
          >
            <GeneralInfoTab loanRequest={loanRequest} client={client} />
          </TabsContent>

          <TabsContent
            value='vehicle'
            className='mt-4 space-y-4 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
          >
            <VehicleInfoTab loanRequest={loanRequest} />
          </TabsContent>

          <TabsContent
            value='financial'
            className='mt-4 space-y-4 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
          >
            <FinancialInfoTab loanRequest={loanRequest} />
          </TabsContent>

          {showVisitTab && (
            <TabsContent
              value='visit'
              className='mt-4 space-y-4 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
            >
              <VisitInfoTab visit={visit} />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
      {loanRequest.comment && (
        <CardFooter className='border-t bg-muted/50 px-6 py-3'>
          <div className='flex items-start gap-2'>
            <FileText className='mt-0.5 h-4 w-4 text-amber-500' />
            <div>
              <p className='text-xs font-medium text-muted-foreground'>
                Comentario
              </p>
              <p className='line-clamp-1 text-sm'>{loanRequest.comment}</p>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
