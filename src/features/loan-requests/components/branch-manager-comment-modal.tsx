import { useState } from 'react';
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
import { toast } from 'sonner';

interface BranchManagerCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
}

export function BranchManagerCommentModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  error
}: BranchManagerCommentModalProps) {
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error('Por favor, ingrese un comentario');
      return;
    }

    try {
      await onSubmit(comment);
      setComment('');
      onClose();
    } catch (error) {
      // Error is handled by the parent component
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Comentario</DialogTitle>
          <DialogDescription>
            Por favor, ingrese su comentario sobre la solicitud de préstamo.
          </DialogDescription>
        </DialogHeader>

        <div className='py-4'>
          <Textarea
            placeholder='Escriba su comentario aquí...'
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className='min-h-[100px]'
          />
          {error && <p className='mt-2 text-sm text-red-500'>{error}</p>}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar Comentario'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
