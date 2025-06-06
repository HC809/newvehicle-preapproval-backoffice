'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { XCircle } from 'lucide-react';

interface DeclineTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  error?: string;
}

export function DeclineTermsModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  error
}: DeclineTermsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-red-600'>
            <XCircle className='h-5 w-5' />
            Declinar Términos
          </DialogTitle>
          <DialogDescription className='text-sm md:text-base'>
            ¿Está seguro que desea declinar los términos del préstamo? Esta
            acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className='rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/50 dark:text-red-400'>
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant='destructive'
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Declinando...' : 'Declinar Términos'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
