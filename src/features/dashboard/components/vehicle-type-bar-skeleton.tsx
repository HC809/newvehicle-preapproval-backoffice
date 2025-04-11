import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function VehicleTypeBarSkeleton() {
  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between p-6'>
        <div className='space-y-1.5'>
          <Skeleton className='h-6 w-[220px]' />
          <Skeleton className='h-4 w-[250px]' />
        </div>
        <Skeleton className='h-9 w-9 rounded-md' />
      </CardHeader>
      <CardContent className='p-6'>
        <div className='mb-6 space-y-3'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-4 w-[150px]' />
            <Skeleton className='h-5 w-[60px]' />
          </div>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-4 w-[120px]' />
            <Skeleton className='h-5 w-[40px]' />
          </div>
        </div>

        {/* Horizontal bar-like shapes */}
        <div className='space-y-6 pt-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='flex items-center gap-3'>
              <Skeleton className='h-4 w-[100px]' />
              <div className='flex-1'>
                <Skeleton
                  className='h-8 rounded-md'
                  style={{
                    width: `${Math.max(30, Math.random() * 95)}%`
                  }}
                />
              </div>
              <Skeleton className='h-4 w-[30px]' />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
