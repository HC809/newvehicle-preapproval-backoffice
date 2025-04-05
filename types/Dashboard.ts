import { LoanRequestStatus } from './LoanRequests';

export interface DealershipRequestCount {
  dealershipId: string;
  dealershipName: string;
  requestCount: number;
}

export interface DealershipStatistics {
  dealerships: DealershipRequestCount[];
}

export interface LoanRequestStatistics {
  totalRequests: number;
  requestsByStatus: Record<LoanRequestStatus, number>;
}
