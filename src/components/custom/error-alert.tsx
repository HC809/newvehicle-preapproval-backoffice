import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export default function ErrorAlert({ error }: { error: string }) {
  return (
    <Alert variant={'destructive'}>
      <ExclamationTriangleIcon className='h-4 w-4' />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
