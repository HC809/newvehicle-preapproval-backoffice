'use client';

import React, { useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { FileUploader } from '@/components/file-uploader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SaveIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DocumentType, documentTypeTranslations } from 'types/LoanDocument';
import { useCreateLoanDocument } from '../api/loan-document-service';
import useAxios from '@/hooks/use-axios';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
];

const formSchema = z.object({
  file: z
    .any()
    .refine((files) => files?.length === 1, 'Se requiere un archivo.')
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `El tamaño máximo del archivo es 10MB.`
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Formato de archivo no válido. Se aceptan .pdf, .jpg, .jpeg, y .png.'
    ),
  documentType: z.nativeEnum(DocumentType, {
    errorMap: () => ({ message: 'Debe seleccionar un tipo de documento.' })
  })
});

type DocumentUploadFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanRequestId?: string;
  clientId?: string;
  onSuccess?: () => void;
};

export default function DocumentUploadForm({
  open,
  onOpenChange,
  loanRequestId,
  clientId,
  onSuccess
}: DocumentUploadFormProps) {
  const apiClient = useAxios();
  const createDocumentMutation = useCreateLoanDocument(apiClient);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: undefined,
      file: undefined
    },
    mode: 'onChange'
  });

  // Simple form reset function
  const resetForm = useCallback(() => {
    form.reset({
      documentType: undefined,
      file: undefined
    });
  }, [form]);

  // Form submission handler
  const handleSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      createDocumentMutation.mutate(
        {
          documentType: values.documentType,
          file: values.file[0],
          loanRequestId,
          clientId
        },
        {
          onSuccess: () => {
            resetForm();
            onOpenChange(false);
            if (onSuccess) {
              onSuccess();
            }
            toast.success('Documento subido', {
              description: 'El documento ha sido subido correctamente.'
            });
          }
        }
      );
    },
    [
      createDocumentMutation,
      resetForm,
      onOpenChange,
      onSuccess,
      loanRequestId,
      clientId
    ]
  );

  const isFormLocked = createDocumentMutation.isPending;

  // Handle close button or dialog close
  const handleClose = useCallback(() => {
    if (isFormLocked) return; // Prevent closing if mutations are pending
    resetForm();
    createDocumentMutation.reset();
    onOpenChange(false);
  }, [resetForm, onOpenChange, createDocumentMutation, isFormLocked]);

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        documentType: undefined,
        file: undefined
      });
    }
  }, [open, form]);

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpenState) => {
        if (!newOpenState && isFormLocked) return; // Prevent closing if mutations are pending
        onOpenChange(newOpenState);
      }}
    >
      <DialogContent
        className='sm:max-w-[500px]'
        onEscapeKeyDown={(event) => {
          if (isFormLocked) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (isFormLocked) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className='text-lg md:text-xl'>
            Cargar documento
          </DialogTitle>
          <DialogDescription className='text-sm md:text-base'>
            Seleccione el tipo de documento y el archivo que desea cargar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-6'
          >
            <FormField
              control={form.control}
              name='documentType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de documento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Seleccione el tipo de documento' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(documentTypeTranslations).map(
                        ([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='file'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Archivo</FormLabel>
                  <FormControl>
                    <FileUploader
                      value={field.value}
                      onValueChange={field.onChange}
                      maxFiles={1}
                      maxSize={MAX_FILE_SIZE}
                      accept={{
                        'application/pdf': ['.pdf'],
                        'image/jpeg': ['.jpg', '.jpeg'],
                        'image/png': ['.png']
                      }}
                      disabled={isFormLocked}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {createDocumentMutation.error && (
              <Alert variant='destructive'>
                <AlertDescription>
                  {String(createDocumentMutation.error)}
                </AlertDescription>
              </Alert>
            )}

            <div className='flex justify-end gap-4'>
              <Button
                variant='outline'
                type='button'
                disabled={isFormLocked}
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={isFormLocked || !form.formState.isValid}
              >
                {isFormLocked ? (
                  <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <SaveIcon className='mr-2 h-4 w-4' />
                )}
                {isFormLocked ? 'Subiendo...' : 'Subir documento'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
