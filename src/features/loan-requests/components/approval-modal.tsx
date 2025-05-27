import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  title?: string;
  description?: string;
  isSubmitting?: boolean;
  buttonText?: string;
}

export function ApprovalModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description = '¿Está seguro que desea aprobar esta solicitud? Esta acción no se puede deshacer.',
  isSubmitting,
  buttonText = 'Aprobar'
}: ApprovalModalProps) {
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

        <div className='space-y-4'>
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
              type='button'
              variant='default'
              disabled={isSubmitting}
              onClick={onSubmit}
              className='gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
            >
              {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
              {buttonText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ApprovalModal;
