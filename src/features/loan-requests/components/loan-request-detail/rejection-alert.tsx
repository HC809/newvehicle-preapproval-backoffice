import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText } from 'lucide-react';

interface RejectionAlertProps {
  rejectionReason: string | null;
}

export const RejectionAlert = ({ rejectionReason }: RejectionAlertProps) => {
  if (!rejectionReason) return null;

  return (
    <Alert variant='destructive' className='border-l-4 border-l-red-500'>
      <FileText className='h-4 w-4' />
      <AlertTitle>Motivo de Rechazo</AlertTitle>
      <AlertDescription>{rejectionReason}</AlertDescription>
    </Alert>
  );
};
