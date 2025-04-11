import { LoanRequestStatistics } from 'types/Dashboard';
import { StatusCard } from './status-card';
import { RequestSummary } from './request-summary';
import { LoanRequestStatus } from 'types/LoanRequests';
import { Skeleton } from '@/components/ui/skeleton';

interface StatusStatisticsProps {
  data?: LoanRequestStatistics;
  isLoading: boolean;
}

export function StatusStatistics({ data, isLoading }: StatusStatisticsProps) {
  if (isLoading) {
    return (
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <Skeleton className='h-[113px] w-full' />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Order statuses for display - excluding Cancelled
  const orderedStatuses: LoanRequestStatus[] = [
    LoanRequestStatus.Pending,
    LoanRequestStatus.ApprovedByAgent,
    LoanRequestStatus.RejectedByAgent,
    LoanRequestStatus.ApprovedByManager,
    LoanRequestStatus.RejectedByManager,
    LoanRequestStatus.AcceptedByCustomer,
    LoanRequestStatus.DeclinedByCustomer
  ];

  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
      <RequestSummary totalRequests={data.totalRequests} />

      {orderedStatuses.map((status) => (
        <StatusCard
          key={status}
          status={status}
          count={data.requestsByStatus[status] || 0}
        />
      ))}
    </div>
  );
}
