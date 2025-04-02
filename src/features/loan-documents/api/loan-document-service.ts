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
