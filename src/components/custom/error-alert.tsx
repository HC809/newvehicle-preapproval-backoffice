import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export default function ErrorAlert({ error }: { error: string }) {
  return (
    <div className='flex flex-col items-center justify-center space-y-4 rounded-lg border bg-background p-8'>
      <Alert variant={'destructive'}>
        <ExclamationTriangleIcon className='h-4 w-4' />
        <AlertTitle className='text-base font-semibold'>Error</AlertTitle>
        <AlertDescription className='py-1 text-sm font-medium leading-7'>
          {error}
        </AlertDescription>
      </Alert>
    </div>
  );
}
