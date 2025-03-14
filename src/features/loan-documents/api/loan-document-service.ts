import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { LoanDocumentContent } from 'types/LoanDocument';

const LOAN_DOCUMENTS_KEY = 'loanDocuments';

/**
 * Hook para obtener el contenido de un documento de préstamo
 * Este hook ya no se utiliza directamente, ya que los documentos se abren en una nueva pestaña
 * Se mantiene por compatibilidad con el código existente
 */
export const useLoanDocumentContent = (
  apiClient: AxiosInstance | undefined,
  id: string,
  enabled: boolean = false
): UseQueryResult<LoanDocumentContent, Error> => {
  return useQuery({
    queryKey: [LOAN_DOCUMENTS_KEY, 'content', id],
    queryFn: async (): Promise<LoanDocumentContent> => {
      throw new Error(
        'Este método ya no se utiliza. Los documentos se abren directamente en una nueva pestaña.'
      );
    },
    enabled: false // Deshabilitado por defecto
  });
};

/**
 * Obtiene la extensión de archivo basada en el tipo MIME
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'application/xml': 'xml',
    'text/xml': 'xml',
    'text/plain': 'txt',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
  };

  // Devolver la extensión correspondiente o 'bin' si no se encuentra
  return mimeToExt[mimeType] || 'bin';
}
