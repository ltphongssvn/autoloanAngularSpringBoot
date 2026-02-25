export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  confirmedAt?: string;
  currentSignInAt?: string;
  lastSignInAt?: string;
  signInCount: number;
  createdAt: string;
}

export interface UserUpdateRequest {
  firstName: string;
  lastName: string;
  phone: string;
}
