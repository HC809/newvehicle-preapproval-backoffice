import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FormSchema = z.object({
  rejectionReason: z.string().min(1, {
    message: 'Por favor, ingrese una razón para el rechazo.'
  })
});

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rejectionReason: string) => Promise<void>;
  title?: string;
  description?: string;
  isSubmitting?: boolean;
  error?: string | null;
}

export function RejectionModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  isSubmitting,
  error
}: RejectionModalProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      rejectionReason: ''
    }
  });

  const handleSubmit = async (data: z.infer<typeof FormSchema>) => {
    await onSubmit(data.rejectionReason);
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='rejectionReason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razón del Rechazo</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='Ingrese la razón del rechazo...'
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                type='submit'
                variant='destructive'
                disabled={!form.formState.isValid || isSubmitting}
                className='gap-2'
              >
                {isSubmitting && <Loader2 className='h-4 w-4 animate-spin' />}
                Rechazar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default RejectionModal;
