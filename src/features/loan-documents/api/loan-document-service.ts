import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';
import { CreateLoanDocumentRequest, DocumentType } from 'types/LoanDocument';

export const useCreateLoanDocument = (
  apiClient: AxiosInstance | undefined
): UseMutationResult<any, Error, CreateLoanDocumentRequest> => {
  return useMutation({
    mutationFn: async (data: CreateLoanDocumentRequest) => {
      if (!apiClient) throw new Error('API client not initialized');

      const formData = new FormData();
      if (data.loanRequestId) {
        formData.append('loanRequestId', data.loanRequestId);
      }
      if (data.clientId) {
        formData.append('clientId', data.clientId);
      }
      formData.append('documentType', data.documentType);
      formData.append('file', data.file);
      formData.append('fileName', data.fileName);

      const response = await apiClient.post(
        '/loan-documents/create',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    }
  });
};

export const useDeleteLoanDocument = (
  apiClient: AxiosInstance | undefined
): UseMutationResult<any, Error, string> => {
  return useMutation({
    mutationFn: async (loanDocumentId: string) => {
      if (!apiClient) throw new Error('API client not initialized');

      const response = await apiClient.delete(
        `/loan-documents/${loanDocumentId}`
      );
      return response.data;
    }
  });
};

export const useUpdateLoanDocument = (
  apiClient: AxiosInstance | undefined
): UseMutationResult<
  any,
  Error,
  {
    loanDocumentId: string;
    fileName: string;
    documentType: DocumentType;
  }
> => {
  return useMutation({
    mutationFn: async (data: {
      loanDocumentId: string;
      fileName: string;
      documentType: DocumentType;
    }) => {
      if (!apiClient) throw new Error('API client not initialized');

      const response = await apiClient.put(
        `/loan-documents/${data.loanDocumentId}`,
        {
          fileName: data.fileName,
          documentType: data.documentType
        }
      );

      return response.data;
    }
  });
};
