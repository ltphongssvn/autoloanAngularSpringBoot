export interface MfaStatusResponse {
  enabled: boolean;
}

export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
}

export interface MfaEnableResponse {
  enabled: boolean;
  recoveryCodes?: string[];
}

export interface MfaVerifyRequest {
  code: string;
}

export interface MfaVerifyResponse {
  valid: boolean;
}
