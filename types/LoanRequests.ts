import { Client } from './Client';
import { LoanCalculation } from './LoanCalculation';
import { LoanDocument } from './LoanDocument';
import { LoanRequestEvent } from './LoanRequestEvent';

export enum LoanRequestStatus {
  Pending = 'Pending',
  ApprovedByAgent = 'ApprovedByAgent',
  RejectedByAgent = 'RejectedByAgent',
  ApprovedByManager = 'ApprovedByManager',
  RejectedByManager = 'RejectedByManager',
  AcceptedByCustomer = 'AcceptedByCustomer',
  DeclinedByCustomer = 'DeclinedByCustomer',
  VisitAssigned = 'VisitAssigned',
  Cancelled = 'Cancelled',
  BranchManagerReview = 'BranchManagerReview'
}

export enum IncomeType {
  Salaried = 'Salaried',
  BusinessOwner = 'BusinessOwner',
  Both = 'Both'
}

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
  approvedDownPaymentPercentage: number;
  requestedAmount: number;
  appliedInterestRate: number;
  vehicleInsuranceRate: number;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  monthlyIncome: number | null;
  incomeType: IncomeType | null;
  city: string;
  comment: string;
  status: LoanRequestStatus;
  rejectionReason: string | null;
  createdAt: string;
  isExistingClient: boolean;
  equifaxChecked: boolean;
  bantotalChecked: boolean;
  financingCalculated: boolean;
  managerId?: string;
}

export interface Visit {
  branchCode: number;
  branchName: string;
  branchAddress: string;
  pymeAdvisorId: string;
  pymeAdvisorName: string;
  branchManagerId: string;
  branchManagerName: string;
}

export interface LoanRequestDetail {
  loanRequest: LoanRequest;
  client?: Client;
  documents?: LoanDocument[];
  loanCalculation?: LoanCalculation;
  events?: LoanRequestEvent[];
  visit?: Visit;
}

export interface LoanRequestListingParams {
  viewAll?: boolean;
  dni?: string;
  dealership?: string;
  manager?: string;
  status?: string;
}

export interface UpdateLoanRequestForm {
  id: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleTypeId: string;
  requestedAmount: number;
  approvedLoanTermMonths: number;
  approvedDownPaymentPercentage: number;
  vehicleInsuranceRate: number;
  monthlyIncome: number;
}
