import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';
import { LoanRequestStatus } from 'types/LoanRequests';
import { translateStatus } from '@/utils/getStatusColor';
import { z } from 'zod';

// Schema de validación para la fecha de aprobación
const approvalDateSchema = z.object({
  approvalDate: z.string().refine(
    (date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Fin del día actual
      return selectedDate <= today;
    },
    {
      message: 'La fecha de aprobación no puede ser mayor al día actual'
    }
  )
});

interface CompleteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (approvalDate: string) => Promise<void>;
  currentStatus: LoanRequestStatus;
  isSubmitting?: boolean;
  error?: string | null;
}

export function CompleteRequestModal({
  isOpen,
  onClose,
  onSubmit,
  currentStatus,
  isSubmitting,
  error
}: CompleteRequestModalProps) {
  const [approvalDate, setApprovalDate] = useState(() => {
    // Set default to today's date in YYYY-MM-DD format
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Reset date to today when modal opens
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      setApprovalDate(today.toISOString().split('T')[0]);
      setValidationError(null);

      // Asegurar que el input no tenga focus al abrir el modal
      setTimeout(() => {
        if (dateInputRef.current) {
          dateInputRef.current.blur();
        }
      }, 0);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  // Función para validar la fecha
  const validateDate = (date: string) => {
    try {
      approvalDateSchema.parse({ approvalDate: date });
      setValidationError(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
      }
      return false;
    }
  };

  // Función para manejar el cambio de fecha
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setApprovalDate(newDate);
    validateDate(newDate);
  };

  const handleSubmit = async () => {
    if (!validateDate(approvalDate)) {
      return;
    }
    await onSubmit(approvalDate);
  };

  const isApprovedForCommittee =
    currentStatus === LoanRequestStatus.ApprovedForCommittee;
  const showWarning = !isApprovedForCommittee;

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
          <DialogTitle>Completar Solicitud</DialogTitle>
          <DialogDescription>
            Complete esta solicitud de préstamo. Esta acción no se puede
            deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {showWarning && (
            <Alert className='border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'>
              <AlertTriangle className='h-4 w-4 text-yellow-700 dark:text-yellow-300' />
              <AlertDescription>
                <strong>Advertencia:</strong> Esta solicitud no está en estado{' '}
                <strong>&quot;Aprobada para Comité&quot;</strong>. ¿Está seguro
                de que desea completar la solicitud en el estado actual{' '}
                <strong>({translateStatus(currentStatus)})</strong>?
              </AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='approvalDate'>Fecha de Aprobación</Label>
            <Input
              ref={dateInputRef}
              id='approvalDate'
              type='date'
              value={approvalDate}
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
              disabled={isSubmitting}
              autoFocus={false}
              className={
                validationError ? 'border-red-500 focus:border-red-500' : ''
              }
            />
            {validationError && (
              <p className='text-sm text-red-600 dark:text-red-400'>
                {validationError}
              </p>
            )}
            <p className='text-sm text-muted-foreground'>
              Seleccione la fecha de aprobación. No puede ser mayor al día
              actual.
            </p>
          </div>

          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
              disabled={isSubmitting || !!validationError}
              onClick={handleSubmit}
              className='gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700'
            >
              {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
              Completar Solicitud
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CompleteRequestModal;
