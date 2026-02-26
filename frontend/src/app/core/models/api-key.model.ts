export interface ApiKeyResponse {
  id: number;
  name: string;
  active: boolean;
  key?: string;
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
}

export interface ApiKeyCreateRequest {
  name: string;
  expiresAt?: string;
}
