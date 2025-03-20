import { Client } from './Client';
import { LoanCalculation } from './LoanCalculation';
import { LoanDocument } from './LoanDocument';

export interface LoanRequest {
  id: string;
  dealershipId: string;
  dealershipName: string;
  creatorName: string;
  managerName: string;
  dni: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  requestedLoanTermMonths: number;
  approvedLoanTermMonths: number;
  requestedAmount: number;
  appliedInterestRate: number;
  vehicleInsuranceRate: number;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  monthlyIncome: number | null;
  city: string;
  comment: string;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  isExistingClient: boolean;
  equifaxChecked: boolean;
  bantotalChecked: boolean;
  financingCalculated: boolean;
  managerId?: string;
}

export interface LoanRequestDetail {
  loanRequest: LoanRequest;
  client?: Client;
  documents?: LoanDocument[];
  loanCalculation?: LoanCalculation;
}

export interface LoanRequestListingParams {
  viewAll?: boolean;
  dni?: string;
  dealership?: string;
  manager?: string;
}
