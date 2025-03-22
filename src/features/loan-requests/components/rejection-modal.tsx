import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ReloadIcon } from '@radix-ui/react-icons';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rejectionReason: string) => Promise<void>;
  title?: string;
  description?: string;
  isSubmitting?: boolean;
}

export function RejectionModal({
  isOpen,
  onClose,
  onSubmit,
  title = 'Rechazar Solicitud',
  description = 'Por favor, ingrese la razón del rechazo de la solicitud.',
  isSubmitting = false
}: RejectionModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  // Reset input when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setRejectionReason('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!rejectionReason.trim()) {
      setError('Por favor, ingrese una razón para el rechazo.');
      return;
    }

    try {
      await onSubmit(rejectionReason);
    } catch (error) {
      //console.error('Error al enviar el formulario:', error);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(newOpenState) => {
        if (!newOpenState && isSubmitting) return;
        handleClose();
      }}
    >
      <DialogContent
        onEscapeKeyDown={(event) => {
          if (isSubmitting) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (isSubmitting) {
            event.preventDefault();
          }
        }}
        className='sm:max-w-[500px]'
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='rejectionReason' className='text-sm font-medium'>
              Razón del Rechazo
            </label>
            <Textarea
              id='rejectionReason'
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (e.target.value.trim()) setError('');
              }}
              placeholder='Ingrese la razón del rechazo...'
              className='min-h-[120px] resize-none'
              disabled={isSubmitting}
            />
            {error && (
              <p className='text-sm font-medium text-destructive'>{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              variant='destructive'
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              {isSubmitting ? (
                <>
                  <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                  Rechazando...
                </>
              ) : (
                'Rechazar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
