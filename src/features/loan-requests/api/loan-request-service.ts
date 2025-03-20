import {
  useQuery,
  useMutation,
  UseQueryResult,
  UseMutationResult
} from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import {
  LoanRequest,
  LoanRequestListingParams,
  LoanRequestDetail
} from 'types/LoanRequests';

const LOAN_REQUESTS_KEY = 'loanRequests';

export const useLoanRequests = (
  apiClient: AxiosInstance | undefined,
  params?: LoanRequestListingParams,
  enabled: boolean = true
): UseQueryResult<LoanRequest[], Error> => {
  return useQuery({
    queryKey: [LOAN_REQUESTS_KEY, params],
    queryFn: async (): Promise<LoanRequest[]> => {
      if (!apiClient) throw new Error('API client not initialized');
      const response = await apiClient.get<LoanRequest[]>('/loan-requests');
      return response.data;
    },
    enabled: !!apiClient && enabled
  });
};

export const useLoanRequestDetail = (
  apiClient: AxiosInstance | undefined,
  id: string,
  enabled: boolean = true
): UseQueryResult<LoanRequestDetail, Error> => {
  return useQuery({
    queryKey: [LOAN_REQUESTS_KEY, 'detail', id],
    queryFn: async (): Promise<LoanRequestDetail> => {
      if (!apiClient) throw new Error('API client not initialized');

      const response = await apiClient.get<LoanRequestDetail>(
        `/loan-requests/${id}`
      );
      return response.data;
    },
    enabled: !!apiClient && !!id && enabled
  });
};

// Hook para usar la mutación de Equifax
export const useCheckEquifax = (
  apiClient: AxiosInstance | undefined
): UseMutationResult<
  boolean,
  string,
  { clientDni: string; loanRequestId: string }
> => {
  return useMutation({
    mutationFn: async ({ clientDni, loanRequestId }) => {
      if (!apiClient) throw new Error('API client not initialized');
      return checkClientEquifax(apiClient, clientDni, loanRequestId);
    }
  });
};

export const useDocumentContent = (
  apiClient: AxiosInstance | undefined,
  documentId: string | undefined,
  enabled: boolean = true
): UseQueryResult<
  { blob: Blob; fileName: string; contentType: string },
  string
> => {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      if (!apiClient) throw new Error('API client not initialized');
      if (!documentId) throw new Error('Document ID is required');
      return getDocumentContent(apiClient, documentId);
    },
    enabled: !!apiClient && !!documentId && enabled
  });
};

// Función para obtener el contenido de un documento
export const getDocumentContent = async (
  apiClient: AxiosInstance,
  documentId: string
): Promise<{ blob: Blob; fileName: string; contentType: string }> => {
  if (!apiClient) throw new Error('API client not initialized');
  if (!documentId) throw new Error('Document ID is required');

  const response = await apiClient.get(
    `/loan-documents/content/${documentId}`,
    {
      responseType: 'arraybuffer',
      headers: {
        Accept: 'application/pdf,image/*,application/xml,text/xml,*/*'
      }
    }
  );

  const contentType =
    response.headers['content-type'] || 'application/octet-stream';
  const contentDisposition = response.headers['content-disposition'] || '';
  let fileName = `documento_${documentId}`;

  // Intentar extraer el nombre del archivo del header Content-Disposition
  const fileNameMatch = contentDisposition.match(
    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
  );
  if (fileNameMatch && fileNameMatch[1]) {
    fileName = fileNameMatch[1].replace(/['"]/g, '');
  }

  return {
    blob: new Blob([response.data], { type: contentType }),
    fileName,
    contentType
  };
};

// Función para consultar Equifax
export const checkClientEquifax = async (
  apiClient: AxiosInstance,
  clientDni: string,
  loanRequestId: string
): Promise<boolean> => {
  if (!apiClient) throw new Error('API client not initialized');
  if (!clientDni) throw new Error('Client DNI is required');
  if (!loanRequestId) throw new Error('Loan request ID is required');

  const response = await apiClient.post('/clients/equifax', {
    clientDni,
    loanRequestId
  });

  return response.status === 200;
};
