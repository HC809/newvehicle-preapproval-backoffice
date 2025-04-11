'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { DocumentUploadForm } from './index';

interface UploadDocumentButtonProps {
  loanRequestId?: string;
  clientId?: string;
  variant?:
    | 'default'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onDocumentUploaded?: () => void;
}

export default function UploadDocumentButton({
  loanRequestId,
  clientId,
  variant = 'default',
  size = 'default',
  className,
  onDocumentUploaded
}: UploadDocumentButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsDialogOpen(true)}
      >
        <Upload className='mr-2 h-4 w-4' />
        Subir documento
      </Button>

      <DocumentUploadForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        loanRequestId={loanRequestId}
        clientId={clientId}
        onSuccess={onDocumentUploaded}
      />
    </>
  );
}
