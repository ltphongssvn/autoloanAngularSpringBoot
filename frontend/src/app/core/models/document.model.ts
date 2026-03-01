export interface DocumentResponse {
  id: number;
  docType: string;
  fileName: string;
  status: string;
  applicationId: number;
  fileSize?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface DocumentStatusUpdateRequest {
  status: string;
  comment?: string;
}
