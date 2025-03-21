import { useState } from 'react';
import { Eye, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useDocumentContent } from '../api/loan-request-service';
import useAxios from '@/hooks/use-axios';
import { getDocumentIcon } from '@/utils/document-utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { LoanDocument } from 'types/LoanDocument';

interface DocumentViewerProps {
  document: LoanDocument;
}

export const DocumentViewer = ({ document: doc }: DocumentViewerProps) => {
  const apiClient = useAxios();
  const [loadingDocumentId, setLoadingDocumentId] = useState<string | null>(
    null
  );
  const { refetch } = useDocumentContent(apiClient, doc.id);

  const handleViewDocument = async (download = false) => {
    try {
      setLoadingDocumentId(doc.id);
      const { data } = await refetch();

      if (!data) {
        throw new Error('No se pudo obtener el documento');
      }

      const { blob, fileName } = data;

      if (download) {
        // Descargar el archivo
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 100);

        toast.success(`Documento "${fileName}" descargado correctamente`);
      } else {
        // Abrir en una nueva pestaña
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 100);

        toast.success(`Documento "${fileName}" abierto en una nueva pestaña`);
      }
    } catch (error) {
      toast.error('Error al procesar el documento');
    } finally {
      setLoadingDocumentId(null);
    }
  };

  return (
    <div className='flex flex-col items-center rounded-md border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900'>
      <div className='mb-2 flex h-16 w-16 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800'>
        {getDocumentIcon(doc.contentType)}
      </div>
      <span
        className='mb-1 line-clamp-1 max-w-full text-wrap break-words text-center font-medium'
        title={doc.fileName}
      >
        {doc.fileName}
      </span>
      <span className='text-xs text-muted-foreground'>{doc.documentType}</span>
      <span className='text-xs text-muted-foreground'>
        {format(new Date(doc.uploadedAt), 'PPP', {
          locale: es
        })}
      </span>
      <div className='mt-2 flex w-full gap-2'>
        <Button
          variant='outline'
          size='sm'
          className='flex flex-1 items-center justify-center gap-1 text-primary hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20'
          onClick={() => handleViewDocument(false)}
          disabled={loadingDocumentId === doc.id}
          title='Ver documento en una nueva pestaña'
        >
          {loadingDocumentId === doc.id ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Eye className='h-4 w-4' />
          )}
          <span>Ver</span>
        </Button>
        <Button
          variant='outline'
          size='sm'
          className='flex flex-1 items-center justify-center gap-1 text-primary hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20'
          onClick={() => handleViewDocument(true)}
          disabled={loadingDocumentId === doc.id}
          title='Descargar documento'
        >
          {loadingDocumentId === doc.id ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Download className='h-4 w-4' />
          )}
          <span>Descargar</span>
        </Button>
      </div>
    </div>
  );
};
