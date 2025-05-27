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
import { User, FileText, MapPin, Copy, Building } from 'lucide-react';
import { LoanRequest, LoanRequestStatus, Visit } from 'types/LoanRequests';
import { GeneralInfoTab } from './general-info-tab';
import { VehicleInfoTab } from './vehicle-info-tab';
import { FinancialInfoTab } from './financial-info-tab';
import { VisitInfoTab } from './visit-info-tab';
import { BranchManagerTab } from './branch-manager-tab';
import { Client } from 'types/Client';
import { useState } from 'react';

interface MainInfoCardProps {
  loanRequest: LoanRequest;
  client?: Client;
  visit?: Visit;
  branchManagerComment?: string | null;
}

export const MainInfoCard = ({
  loanRequest,
  client,
  visit,
  branchManagerComment
}: MainInfoCardProps) => {
  const [copiedId, setCopiedId] = useState(false);
  const showVisitTab =
    (loanRequest.status === LoanRequestStatus.VisitAssigned ||
      loanRequest.status === LoanRequestStatus.VisitRegistered) &&
    visit;
  const showBranchManagerTab =
    loanRequest.status === LoanRequestStatus.BranchManagerReview && visit;

  const copyId = () => {
    navigator.clipboard.writeText(loanRequest.id.toString());
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Si está en estado VisitAssigned, la pestaña de visita debería ser la predeterminada
  // Si está en estado BranchManagerReview, la pestaña de gerente agencia debería ser la predeterminada
  const defaultTab = showVisitTab
    ? 'visit'
    : showBranchManagerTab
      ? 'branchManager'
      : 'general';

  // Determinar el número de columnas para el TabsList
  const tabsCount = 3 + (showVisitTab ? 1 : 0) + (showBranchManagerTab ? 1 : 0);

  return (
    <Card className='border-l-4 border-l-blue-500 dark:border-l-blue-400'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <div>
          <CardTitle className='flex items-center gap-2 text-xl'>
            Solicitud #{formatLoanRequestId(loanRequest.id)}
            <button
              onClick={copyId}
              className='rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800'
              title='Copiar ID'
            >
              <Copy className='h-3 w-3 text-gray-500' />
            </button>
            {copiedId && (
              <span className='text-xs text-green-500'>¡Copiado!</span>
            )}
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
          <TabsList className={`grid w-full grid-cols-${tabsCount}`}>
            <TabsTrigger value='general'>General</TabsTrigger>
            <TabsTrigger value='vehicle'>Vehículo</TabsTrigger>
            <TabsTrigger value='financial'>Financiero</TabsTrigger>
            {showVisitTab && (
              <TabsTrigger value='visit' className='flex items-center gap-1'>
                <MapPin className='h-3.5 w-3.5' />
                Visita
              </TabsTrigger>
            )}
            {showBranchManagerTab && (
              <TabsTrigger
                value='branchManager'
                className='flex items-center gap-1'
              >
                <Building className='h-3.5 w-3.5' />
                Agencia
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
              {visit ? (
                <VisitInfoTab
                  visit={visit}
                  branchManagerComment={branchManagerComment}
                />
              ) : (
                <div className='py-4 text-center text-muted-foreground'>
                  No hay información de visita disponible
                </div>
              )}
            </TabsContent>
          )}

          {showBranchManagerTab && (
            <TabsContent
              value='branchManager'
              className='mt-4 space-y-4 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
            >
              <BranchManagerTab visit={visit} />
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
