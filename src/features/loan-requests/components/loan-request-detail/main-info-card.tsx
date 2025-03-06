import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { translateStatus } from '@/utils/getStatusColor';
import { formatLoanRequestId } from '@/utils/formatId';
import { User } from 'lucide-react';
import { LoanRequest } from 'types/LoanRequests';
import { GeneralInfoTab } from './general-info-tab';
import { VehicleInfoTab } from './vehicle-info-tab';
import { FinancialInfoTab } from './financial-info-tab';

interface MainInfoCardProps {
  loanRequest: LoanRequest;
}

export const MainInfoCard = ({ loanRequest }: MainInfoCardProps) => {
  // Traducir el estado al español
  const translatedStatus = translateStatus(loanRequest.status);

  return (
    <Card className='border-t-4 border-t-blue-500 dark:border-t-blue-400'>
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
        <Badge variant={'warning'}>{translatedStatus}</Badge>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='general' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='general'>General</TabsTrigger>
            <TabsTrigger value='vehicle'>Vehículo</TabsTrigger>
            <TabsTrigger value='financial'>Financiero</TabsTrigger>
          </TabsList>

          <TabsContent
            value='general'
            className='mt-4 space-y-4 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
          >
            <GeneralInfoTab loanRequest={loanRequest} />
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
        </Tabs>
      </CardContent>
    </Card>
  );
};
