import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getStatusVariant,
  translateStatus,
  getStatusClassName
} from '@/utils/getStatusColor';
import { LoanRequestStatus } from 'types/LoanRequests';
import { cn } from '@/lib/utils';

interface StatusCardProps {
  status: LoanRequestStatus;
  count: number;
}

// Helper function to get pastel background colors
function getPastelBackgroundColor(status: LoanRequestStatus): string {
  switch (status) {
    case LoanRequestStatus.Pending:
      return 'bg-amber-50 dark:bg-amber-950/30';
    case LoanRequestStatus.ApprovedByAgent:
    case LoanRequestStatus.ApprovedByManager:
      return 'bg-green-50 dark:bg-green-950/30';
    case LoanRequestStatus.RejectedByAgent:
    case LoanRequestStatus.RejectedByManager:
      return 'bg-red-50 dark:bg-red-950/30';
    case LoanRequestStatus.AcceptedByCustomer:
      return 'bg-blue-50 dark:bg-blue-950/30';
    case LoanRequestStatus.DeclinedByCustomer:
      return 'bg-gray-100 dark:bg-gray-800/50';
    default:
      return '';
  }
}

// Helper function to get text color
function getTextColor(status: LoanRequestStatus): string {
  switch (status) {
    case LoanRequestStatus.Pending:
      return 'text-amber-700 dark:text-amber-500';
    case LoanRequestStatus.ApprovedByAgent:
    case LoanRequestStatus.ApprovedByManager:
      return 'text-green-700 dark:text-green-500';
    case LoanRequestStatus.RejectedByAgent:
    case LoanRequestStatus.RejectedByManager:
      return 'text-red-700 dark:text-red-500';
    case LoanRequestStatus.AcceptedByCustomer:
      return 'text-blue-700 dark:text-blue-500';
    case LoanRequestStatus.DeclinedByCustomer:
      return 'text-gray-700 dark:text-gray-400';
    default:
      return '';
  }
}

export function StatusCard({ status, count }: StatusCardProps) {
  const variant = getStatusVariant(status);
  const translatedStatus = translateStatus(status);
  const customClass = getStatusClassName(status);

  // Get pastel background color based on status
  const bgColorClass = getPastelBackgroundColor(status);
  const textColorClass = getTextColor(status);

  return (
    <Card className={cn('transition-all hover:scale-105', bgColorClass)}>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className={cn('text-sm font-bold', textColorClass)}>
          {translatedStatus}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', textColorClass)}>{count}</div>
      </CardContent>
    </Card>
  );
}
