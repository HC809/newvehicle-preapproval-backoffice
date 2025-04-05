import { LoanRequestStatus } from './LoanRequests';

export interface LoanRequestStatistics {
  totalRequests: number;
  requestsByStatus: Record<LoanRequestStatus, number>;
}
