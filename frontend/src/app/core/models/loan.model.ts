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
  createdAt: string;
  updatedAt: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleTrim?: string;
  vehicleVin?: string;
}
