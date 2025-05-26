import { useState } from 'react';
import {
  Eye,
  Download,
  Loader2,
  Trash2,
  Pencil,
  FileText,
  FileImage
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useDocumentContent } from '../api/loan-request-service';
import { useDeleteLoanDocument } from '@/features/loan-documents/api/loan-document-service';
import useAxios from '@/hooks/use-axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import Image from 'next/image';
import {
  LoanDocument,
  DocumentType,
  documentTypeTranslations
} from 'types/LoanDocument';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { AlertModal } from '@/components/modal/alert-modal';
import DocumentUploadForm from '@/features/loan-documents/components/document-upload-form';

type ViewMode = 'grid' | 'list';

interface DocumentViewerProps {
  document: LoanDocument;
  onDocumentDeleted?: () => void;
  onDocumentUpdated?: () => void;
  viewMode?: ViewMode;
}

const getDocumentIcon = (contentType: string) => {
  if (contentType.startsWith('image/')) {
    return <FileImage className='h-6 w-6 text-blue-500' />;
  }
  return <FileText className='h-6 w-6 text-red-500' />;
};

export default function DocumentViewer({
  document: doc,
  onDocumentDeleted,
  onDocumentUpdated,
  viewMode = 'grid'
}: DocumentViewerProps) {
  const apiClient = useAxios();
  const [loadingDocumentId, setLoadingDocumentId] = useState<string | null>(
    null
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { refetch } = useDocumentContent(apiClient, doc.id);
  const deleteDocumentMutation = useDeleteLoanDocument(apiClient);

  const isImage = doc.contentType.startsWith('image/');

  const handleViewDocument = async (isDownload: boolean) => {
    try {
      setLoadingDocumentId(doc.id);
      const { data } = await refetch();

      if (!data) {
        throw new Error('No se pudo obtener el documento');
      }

      const { blob, fileName } = data;
      const blobUrl = URL.createObjectURL(blob);

      if (isDownload) {
        // Descargar el archivo
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
      } else if (isImage) {
        // Mostrar imagen en el modal
        setImageUrl(blobUrl);
        setShowImageModal(true);
      } else {
        // Abrir PDF en una nueva pestaña
        const link = document.createElement('a');
        link.href = blobUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          document.body.removeChild(link);
          // No revocamos la URL para PDFs ya que necesita permanecer válida para la nueva pestaña
        }, 100);

        toast.success(`Documento "${fileName}" abierto en una nueva pestaña`);
      }
    } catch (error) {
      toast.error('Error al procesar el documento');
    } finally {
      setLoadingDocumentId(null);
    }
  };

  const handleDeleteDocument = async () => {
    try {
      setLoadingDocumentId(doc.id);
      await deleteDocumentMutation.mutateAsync(doc.id);
      toast.success('Documento eliminado correctamente');
      if (onDocumentDeleted) {
        onDocumentDeleted();
      }
      setShowDeleteModal(false);
      setDeleteError(null);
    } catch (error) {
      setDeleteError(String(error));
    } finally {
      setLoadingDocumentId(null);
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteDocumentMutation.isPending) {
      setShowDeleteModal(false);
      setDeleteError(null);
    }
  };

  // Limpieza de recursos al cerrar el modal de imagen
  const handleCloseImageModal = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <div className='flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800'>
              {getDocumentIcon(doc.contentType)}
            </div>
            <div className='flex flex-col'>
              <span
                className='line-clamp-1 max-w-[400px] text-wrap break-words font-medium'
                title={doc.fileName}
              >
                {doc.fileName}
              </span>
              <div className='flex gap-2 text-xs text-muted-foreground'>
                <span>
                  {documentTypeTranslations[doc.documentType as DocumentType] ||
                    doc.documentType}
                </span>
                <span>•</span>
                <span>
                  {format(new Date(doc.uploadedAt), 'PPP', {
                    locale: es
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center justify-center gap-1 text-primary hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20'
              onClick={() => handleViewDocument(false)}
              disabled={loadingDocumentId === doc.id}
              title={
                isImage ? 'Ver imagen' : 'Ver documento en una nueva pestaña'
              }
            >
              {loadingDocumentId === doc.id ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
              <span className='hidden sm:inline'>Ver</span>
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center justify-center gap-1 text-primary hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20'
              onClick={() => handleViewDocument(true)}
              disabled={loadingDocumentId === doc.id}
              title='Descargar documento'
            >
              {loadingDocumentId === doc.id ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Download className='h-4 w-4' />
              )}
              <span className='hidden sm:inline'>Descargar</span>
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center justify-center gap-1 text-primary hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20'
              onClick={() => setIsEditDialogOpen(true)}
              disabled={loadingDocumentId === doc.id}
              title='Editar documento'
            >
              <Pencil className='h-4 w-4' />
              <span className='hidden sm:inline'>Editar</span>
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='flex items-center justify-center gap-1 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950'
              onClick={() => setShowDeleteModal(true)}
              disabled={loadingDocumentId === doc.id}
              title='Eliminar documento'
            >
              {loadingDocumentId === doc.id ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Trash2 className='h-4 w-4' />
              )}
              <span className='hidden sm:inline'>Eliminar</span>
            </Button>
          </div>
        </div>

        {/* Modal para visualizar imágenes */}
        <Dialog
          open={showImageModal}
          onOpenChange={(open) => {
            setShowImageModal(open);
            if (!open) handleCloseImageModal();
          }}
        >
          <DialogContent className='flex h-[80vh] flex-col sm:max-w-[80vw]'>
            <DialogHeader>
              <DialogTitle>{doc.fileName}</DialogTitle>
            </DialogHeader>
            <div className='flex flex-1 items-center justify-center overflow-auto p-4'>
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={doc.fileName}
                  className='max-h-full max-w-full object-contain'
                  width={1200}
                  height={900}
                  style={{ maxHeight: 'calc(80vh - 80px)' }}
                  priority
                  unoptimized
                />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de confirmación para eliminar documento */}
        <AlertModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteDocument}
          loading={deleteDocumentMutation.isPending}
          title='Eliminar documento'
          description={`¿Está seguro que desea eliminar el documento "${doc.fileName}"? Esta acción no se puede deshacer.`}
          confirmLabel={
            deleteDocumentMutation.isPending ? 'Eliminando...' : 'Eliminar'
          }
          cancelLabel='Cancelar'
          error={deleteError}
          intent='delete'
        />

        <DocumentUploadForm
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          mode='edit'
          document={{
            id: doc.id,
            fileName: doc.fileName,
            documentType: doc.documentType as DocumentType
          }}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            if (onDocumentUpdated) {
              onDocumentUpdated();
            }
            toast.success('Documento actualizado', {
              description: 'El documento ha sido actualizado correctamente.'
            });
          }}
        />
      </>
    );
  }

  return (
    <>
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
        <span className='text-xs text-muted-foreground'>
          {documentTypeTranslations[doc.documentType as DocumentType] ||
            doc.documentType}
        </span>
        <span className='text-xs text-muted-foreground'>
          {format(new Date(doc.uploadedAt), 'PPP', {
            locale: es
          })}
        </span>
        <div className='mt-2 grid w-full grid-cols-4 gap-1'>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center justify-center gap-1 text-primary hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20'
            onClick={() => handleViewDocument(false)}
            disabled={loadingDocumentId === doc.id}
            title={
              isImage ? 'Ver imagen' : 'Ver documento en una nueva pestaña'
            }
          >
            {loadingDocumentId === doc.id ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Eye className='h-4 w-4' />
            )}
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center justify-center gap-1 text-primary hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20'
            onClick={() => handleViewDocument(true)}
            disabled={loadingDocumentId === doc.id}
            title='Descargar documento'
          >
            {loadingDocumentId === doc.id ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Download className='h-4 w-4' />
            )}
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center justify-center gap-1 text-primary hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20'
            onClick={() => setIsEditDialogOpen(true)}
            disabled={loadingDocumentId === doc.id}
            title='Editar documento'
          >
            <Pencil className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='flex items-center justify-center gap-1 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950'
            onClick={() => setShowDeleteModal(true)}
            disabled={loadingDocumentId === doc.id}
            title='Eliminar documento'
          >
            {loadingDocumentId === doc.id ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Trash2 className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>

      {/* Modal para visualizar imágenes */}
      <Dialog
        open={showImageModal}
        onOpenChange={(open) => {
          setShowImageModal(open);
          if (!open) handleCloseImageModal();
        }}
      >
        <DialogContent className='flex h-[80vh] flex-col sm:max-w-[80vw]'>
          <DialogHeader>
            <DialogTitle>{doc.fileName}</DialogTitle>
          </DialogHeader>
          <div className='flex flex-1 items-center justify-center overflow-auto p-4'>
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={doc.fileName}
                className='max-h-full max-w-full object-contain'
                width={1200}
                height={900}
                style={{ maxHeight: 'calc(80vh - 80px)' }}
                priority
                unoptimized
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminar documento */}
      <AlertModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteDocument}
        loading={deleteDocumentMutation.isPending}
        title='Eliminar documento'
        description={`¿Está seguro que desea eliminar el documento "${doc.fileName}"? Esta acción no se puede deshacer.`}
        confirmLabel={
          deleteDocumentMutation.isPending ? 'Eliminando...' : 'Eliminar'
        }
        cancelLabel='Cancelar'
        error={deleteError}
        intent='delete'
      />

      <DocumentUploadForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        mode='edit'
        document={{
          id: doc.id,
          fileName: doc.fileName,
          documentType: doc.documentType as DocumentType
        }}
        onSuccess={() => {
          setIsEditDialogOpen(false);
          if (onDocumentUpdated) {
            onDocumentUpdated();
          }
          toast.success('Documento actualizado', {
            description: 'El documento ha sido actualizado correctamente.'
          });
        }}
      />
    </>
  );
}
