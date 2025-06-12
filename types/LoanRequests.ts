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
  VisitRegistered = 'VisitRegistered',
  ApprovedForCommittee = 'ApprovedForCommittee',
  Cancelled = 'Cancelled',
  BranchManagerReview = 'BranchManagerReview',
  Completed = 'Completed'
}

export enum IncomeType {
  Salaried = 'Salaried',
  BusinessOwner = 'BusinessOwner',
  Both = 'Both'
}

export enum DownPaymentType {
  Percentage = 'Percentage',
  Amount = 'Amount'
}

export interface LoanRequest {
  id: string;
  dealershipId: string;
  dealershipName: string;
  creatorName: string;
  managerName: string;
  clientName: string;
  dni: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  requestedLoanTermMonths: number;
  approvedLoanTermMonths: number;
  downPaymentType: DownPaymentType;
  approvedDownPaymentPercentage: number | null;
  requestedDownPaymentAmount: number | null;
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
  branchManagerComment: string | null;
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
  participants?: ChatParticipant[];
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
  downPaymentType: DownPaymentType;
  approvedDownPaymentPercentage: number | null;
  requestedDownPaymentAmount: number | null;
  vehicleInsuranceRate: number;
  monthlyIncome: number | null;
  comment?: string;
}

export interface CreateLoanRequest {
  dni: string;
  vehicleTypeId: string;
  requestedAmount: number;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  monthlyIncome: number | null;
  dealershipAdminId: string;
  city?: string;
  comment?: string;
}

export interface ChatParticipant {
  id: string;
  name: string;
}
