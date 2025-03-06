import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserCog } from 'lucide-react';
import { LoanRequest } from 'types/LoanRequests';

interface ResponsiblePersonsCardProps {
  loanRequest: LoanRequest;
}

export const ResponsiblePersonsCard = ({
  loanRequest
}: ResponsiblePersonsCardProps) => {
  return (
    <Card className='border-l-4 border-l-purple-500 dark:border-l-purple-400'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg'>
          <UserCog className='h-5 w-5 text-purple-500 dark:text-purple-400' />
          <span>Responsables</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center space-x-4'>
          <Avatar className='border-2 border-green-200 bg-green-50 dark:bg-green-900/20'>
            <AvatarFallback className='text-green-700 dark:text-green-300'>
              {loanRequest.creatorName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className='text-sm font-medium text-green-700 dark:text-green-300'>
              {loanRequest.creatorName}
            </p>
            <p className='text-xs text-muted-foreground'>Creador</p>
          </div>
        </div>
        <Separator />
        <div className='flex items-center space-x-4'>
          <Avatar className='border-2 border-purple-200 bg-purple-50 dark:bg-purple-900/20'>
            <AvatarFallback className='text-purple-700 dark:text-purple-300'>
              {loanRequest.managerName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className='text-sm font-medium text-purple-700 dark:text-purple-300'>
              {loanRequest.managerName}
            </p>
            <p className='text-xs text-muted-foreground'>
              Oficial de Negocio Asignado
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
