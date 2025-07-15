import { FileText, Grid, List, ArrowUp, ArrowDown } from 'lucide-react';
import { LoanDocument } from 'types/LoanDocument';
import UploadDocumentButton from './upload-document-button';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import DocumentViewer from '@/features/loan-requests/components/document-viewer';

type ViewMode = 'grid' | 'list';

interface DocumentsSectionProps {
  documents: LoanDocument[];
  loanRequestId?: string;
  clientId?: string;
  onDocumentUploaded: () => void;
  onDocumentDeleted: () => void;
  height?: string;
  showUploadButton?: boolean;
}

// Función para extraer el número al inicio del nombre del documento
const extractNumberFromName = (fileName: string): number => {
  const match = fileName.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

// Función para ordenar documentos por número al inicio del nombre
const sortDocumentsByName = (
  documents: LoanDocument[],
  ascending: boolean = true
): LoanDocument[] => {
  return documents.slice().sort((a, b) => {
    const numA = extractNumberFromName(a.fileName);
    const numB = extractNumberFromName(b.fileName);

    if (numA !== numB) {
      return ascending ? numA - numB : numB - numA;
    }

    // Si no tienen número o tienen el mismo número, ordenar alfabéticamente
    return ascending
      ? a.fileName.localeCompare(b.fileName)
      : b.fileName.localeCompare(a.fileName);
  });
};

export function DocumentsSection({
  documents,
  loanRequestId,
  clientId,
  onDocumentUploaded,
  onDocumentDeleted,
  height = '300px',
  showUploadButton = true
}: DocumentsSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortedDocuments, setSortedDocuments] = useState<LoanDocument[]>(() =>
    sortDocumentsByName(documents, true)
  );

  // Función para ordenar ascendente
  const handleSortAscending = () => {
    setSortOrder('asc');
    setSortedDocuments(sortDocumentsByName(documents, true));
  };

  // Función para ordenar descendente
  const handleSortDescending = () => {
    setSortOrder('desc');
    setSortedDocuments(sortDocumentsByName(documents, false));
  };

  // Actualizar documentos ordenados cuando cambien los documentos
  useEffect(() => {
    setSortedDocuments(sortDocumentsByName(documents, sortOrder === 'asc'));
  }, [documents, sortOrder]);

  if (!documents || documents.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center'>
        <FileText className='mb-2 h-10 w-10 text-muted-foreground/70' />
        <h3 className='mb-2 text-lg font-semibold'>No hay documentos</h3>
        <p className='mb-6 text-muted-foreground'>
          No se han cargado documentos para esta solicitud.
        </p>
        {loanRequestId && showUploadButton && (
          <UploadDocumentButton
            loanRequestId={loanRequestId}
            clientId={clientId}
            onDocumentUploaded={onDocumentUploaded}
          />
        )}
      </div>
    );
  }

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
              title='Vista de lista'
            >
              <List className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('grid')}
              className='h-8 w-8 p-0'
              title='Vista de cuadrícula'
            >
              <Grid className='h-4 w-4' />
            </Button>
          </div>
          <div className='flex items-center gap-1 rounded-lg border p-1'>
            <Button
              variant={sortOrder === 'asc' ? 'default' : 'ghost'}
              size='sm'
              onClick={handleSortAscending}
              className='h-8 w-8 p-0'
              title='Ordenar documentos de menor a mayor número'
            >
              <ArrowUp className='h-4 w-4' />
            </Button>
            <Button
              variant={sortOrder === 'desc' ? 'default' : 'ghost'}
              size='sm'
              onClick={handleSortDescending}
              className='h-8 w-8 p-0'
              title='Ordenar documentos de mayor a menor número'
            >
              <ArrowDown className='h-4 w-4' />
            </Button>
          </div>
        </div>
        {loanRequestId && showUploadButton && (
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
