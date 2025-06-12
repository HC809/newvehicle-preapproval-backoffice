import { FileText, Grid, List } from 'lucide-react';
import { LoanDocument } from 'types/LoanDocument';
import UploadDocumentButton from './upload-document-button';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import DocumentViewer from '@/features/loan-requests/components/document-viewer';

type ViewMode = 'grid' | 'list';

interface DocumentsSectionProps {
  documents: LoanDocument[];
  loanRequestId?: string;
  clientId?: string;
  onDocumentUploaded: () => void;
  onDocumentDeleted: () => void;
  height?: string;
}

export function DocumentsSection({
  documents,
  loanRequestId,
  clientId,
  onDocumentUploaded,
  onDocumentDeleted,
  height = '300px'
}: DocumentsSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  if (!documents || documents.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center'>
        <FileText className='mb-2 h-10 w-10 text-muted-foreground/70' />
        <h3 className='mb-2 text-lg font-semibold'>No hay documentos</h3>
        <p className='mb-6 text-muted-foreground'>
          No se han cargado documentos para esta solicitud.
        </p>
        {loanRequestId && (
          <UploadDocumentButton
            loanRequestId={loanRequestId}
            clientId={clientId}
            onDocumentUploaded={onDocumentUploaded}
          />
        )}
      </div>
    );
  }

  const sortedDocuments = documents
    .slice()
    .sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

  return (
    <div
      className={`flex flex-col rounded-lg border border-l-4 border-l-primary p-4 shadow-sm`}
      style={{ height }}
    >
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <h3 className='flex items-center gap-2 text-lg font-semibold'>
            <FileText className='h-5 w-5 text-primary dark:text-primary' />
            <span>Documentos ({documents.length})</span>
          </h3>
          <div className='flex items-center gap-1 rounded-lg border p-1'>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('list')}
              className='h-8 w-8 p-0'
            >
              <List className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('grid')}
              className='h-8 w-8 p-0'
            >
              <Grid className='h-4 w-4' />
            </Button>
          </div>
        </div>
        {loanRequestId && (
          <UploadDocumentButton
            loanRequestId={loanRequestId}
            clientId={clientId}
            variant='outline'
            size='sm'
            onDocumentUploaded={onDocumentUploaded}
          />
        )}
      </div>
      <div
        className={`flex-1 overflow-y-auto ${
          viewMode === 'grid'
            ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'
            : 'flex flex-col gap-2'
        }`}
      >
        {sortedDocuments.map((doc) => (
          <DocumentViewer
            key={doc.id}
            document={doc}
            onDocumentDeleted={onDocumentDeleted}
            onDocumentUpdated={onDocumentUploaded}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}
