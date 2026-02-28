// frontend/src/app/core/models/loan.model.ts
export interface LoanApplicationRequest {
  loanAmount: number;
  downPayment: number;
  loanTerm: number;
  dob?: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleTrim?: string;
  vehicleVin?: string;
  vehicleMileage?: number | null;
  vehicleCondition?: string;
  vehicleEstimatedValue?: number;
}

export interface LoanApplicationResponse {
  id: number;
  applicationNumber: string;
  status: string;
  currentStep: number;
  dob?: string;
  loanAmount: number;
  downPayment: number;
  loanTerm: number;
  interestRate?: number;
  monthlyPayment?: number;
  rejectionReason?: string;
  userId: number;
  submittedAt?: string;
  decidedAt?: string;
  signatureData?: string;
  signedAt?: string;
  agreementAccepted?: boolean;
  createdAt: string;
  updatedAt: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleTrim?: string;
  vehicleVin?: string;
  // Detail fields from ApplicationDetailResponse
  links?: Record<string, string>;
  personalInfo?: Record<string, string>;
  carDetails?: Record<string, string>;
  loanDetails?: Record<string, string>;
  employmentInfo?: Record<string, string>;
  documents?: Record<string, unknown>[];
  statusHistories?: Record<string, unknown>[];
}
