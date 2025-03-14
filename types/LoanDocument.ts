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
