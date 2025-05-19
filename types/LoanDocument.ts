export interface LoanDocument {
  id: string;
  fileName: string;
  documentType: string;
  uploadedAt: string;
  contentType: string;
}

export interface LoanDocumentContent {
  fileData: Blob;
  contentType: string;
  fileName: string;
}

export enum DocumentType {
  Private = 'Private',
  Public = 'Public'
}

export const documentTypeTranslations: Record<DocumentType, string> = {
  [DocumentType.Private]: 'Privado',
  [DocumentType.Public]: 'Público'
};

export interface CreateLoanDocumentRequest {
  loanRequestId?: string;
  clientId?: string;
  documentType: DocumentType;
  file: File;
}
