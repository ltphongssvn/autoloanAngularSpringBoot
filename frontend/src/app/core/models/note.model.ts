export interface NoteResponse {
  id: number;
  note: string;
  internal?: boolean;
  applicationId: number;
  userId: number;
  createdAt: string;
}

export interface NoteCreateRequest {
  note: string;
  internal?: boolean;
}
