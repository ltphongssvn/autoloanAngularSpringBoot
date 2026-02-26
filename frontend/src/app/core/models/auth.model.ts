export interface LoginRequest {
  email: string;
  password: string;
  otpCode?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  userId: number;
  otpRequired: boolean;
}

export interface MessageResponse {
  message: string;
}
