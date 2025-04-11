import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequestSummaryProps {
  totalRequests: number;
}

export function RequestSummary({ totalRequests }: RequestSummaryProps) {
  return (
    <Card
      className={cn(
        'transition-all hover:scale-105',
        'bg-primary-50 dark:bg-primary-950/30'
      )}
    >
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-primary-700 dark:text-primary-500 text-sm font-bold'>
          Total
        </CardTitle>
        <FileText className='text-primary-700 dark:text-primary-500 h-4 w-4' />
      </CardHeader>
      <CardContent>
        <div className='text-primary-700 dark:text-primary-500 text-2xl font-bold'>
          {totalRequests}
        </div>
      </CardContent>
    </Card>
  );
}
