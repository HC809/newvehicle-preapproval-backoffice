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
  Equifax = 'Equifax',
  Identity = 'Identity',
  ProofOfIncome = 'ProofOfIncome',
  ProofOfResidence = 'ProofOfResidence',
  Other = 'Other'
}

export const documentTypeTranslations: Record<DocumentType, string> = {
  [DocumentType.Equifax]: 'Equifax',
  [DocumentType.Identity]: 'Identificación',
  [DocumentType.ProofOfIncome]: 'Comprobante de ingresos',
  [DocumentType.ProofOfResidence]: 'Comprobante de domicilio',
  [DocumentType.Other]: 'Otro'
};

export interface CreateLoanDocumentRequest {
  loanRequestId?: string;
  clientId?: string;
  documentType: DocumentType;
  file: File;
}
