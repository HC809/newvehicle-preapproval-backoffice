'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils'; // Make sure this import exists

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  error?: string | null;
  // Use 'intent' instead of 'variant' to avoid type conflicts
  intent?: 'delete' | 'restore' | 'default';
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title,
  description,
  confirmLabel = 'Continuar',
  cancelLabel = 'Cancelar',
  error = null,
  intent = 'default'
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Map intent to button styling
  const getButtonStyling = () => {
    switch (intent) {
      case 'delete':
        return {
          variant: 'destructive' as const,
          className: ''
        };
      case 'restore':
        return {
          variant: 'default' as const,
          className: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      default:
        return {
          variant: 'default' as const,
          className: ''
        };
    }
  };

  const buttonStyle = getButtonStyling();

  return (
    <Modal
      title={title}
      description={description}
      isOpen={isOpen}
      onClose={onClose}
    >
      {error && (
        <Alert variant='destructive' className='mt-4'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className='flex w-full items-center justify-end space-x-2 pt-6'>
        <Button disabled={loading} variant='outline' onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          disabled={loading}
          variant={buttonStyle.variant}
          className={cn(buttonStyle.className)}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};
