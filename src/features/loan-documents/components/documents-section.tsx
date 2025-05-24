import { FileText } from 'lucide-react';
import { DocumentViewer } from '@/features/loan-requests/components/document-viewer';
import { LoanDocument } from 'types/LoanDocument';
import UploadDocumentButton from './upload-document-button';

interface DocumentsSectionProps {
  documents: LoanDocument[];
  loanRequestId: string;
  clientId?: string;
  onDocumentUploaded: () => void;
  onDocumentDeleted: () => void;
}

export function DocumentsSection({
  documents,
  loanRequestId,
  clientId,
  onDocumentUploaded,
  onDocumentDeleted
}: DocumentsSectionProps) {
  if (!documents || documents.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center'>
        <FileText className='mb-2 h-10 w-10 text-muted-foreground/70' />
        <h3 className='mb-2 text-lg font-semibold'>No hay documentos</h3>
        <p className='mb-6 text-muted-foreground'>
          No se han cargado documentos para esta solicitud.
        </p>
        <UploadDocumentButton
          loanRequestId={loanRequestId}
          clientId={clientId}
          onDocumentUploaded={onDocumentUploaded}
        />
      </div>
    );
  }

  return (
    <div className='flex h-[300px] flex-col rounded-lg border border-l-4 border-l-primary p-4 shadow-sm'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='flex items-center gap-2 text-lg font-semibold'>
          <FileText className='h-5 w-5 text-primary dark:text-primary' />
          <span>Documentos ({documents.length})</span>
        </h3>
        <UploadDocumentButton
          loanRequestId={loanRequestId}
          clientId={clientId}
          variant='outline'
          size='sm'
          onDocumentUploaded={onDocumentUploaded}
        />
      </div>
      <div className='grid flex-1 grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 md:grid-cols-3'>
        {documents
          .slice()
          .sort(
            (a, b) =>
              new Date(b.uploadedAt).getTime() -
              new Date(a.uploadedAt).getTime()
          )
          .map((doc) => (
            <DocumentViewer
              key={doc.id}
              document={doc}
              onDocumentDeleted={onDocumentDeleted}
            />
          ))}
      </div>
    </div>
  );
}
