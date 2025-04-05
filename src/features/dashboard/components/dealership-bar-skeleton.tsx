import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DealershipBarSkeleton() {
  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between p-6'>
        <div className='space-y-1.5'>
          <Skeleton className='h-6 w-[180px]' />
          <Skeleton className='h-4 w-[250px]' />
        </div>
        <Skeleton className='h-9 w-9 rounded-md' />
      </CardHeader>
      <CardContent className='p-6'>
        <div className='mb-6 space-y-3'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-4 w-[140px]' />
            <Skeleton className='h-5 w-[60px]' />
          </div>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-4 w-[140px]' />
            <Skeleton className='h-5 w-[40px]' />
          </div>
        </div>

        {/* Bar-like shapes */}
        <div className='flex aspect-auto h-[400px] w-full items-end justify-around gap-2 pt-8'>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className='w-full'
              style={{
                height: `${Math.max(20, Math.random() * 100)}%`
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
