import { LoanRequestStatus } from './LoanRequests';

export interface DealershipRequestCount {
  dealershipId: string;
  dealershipName: string;
  requestCount: number;
}

export interface DealershipStatistics {
  dealerships: DealershipRequestCount[];
}

export interface VehicleTypeRequestCount {
  vehicleTypeId: string;
  vehicleTypeName: string;
  requestCount: number;
}

export interface VehicleTypeStatistics {
  vehicleTypes: VehicleTypeRequestCount[];
}

export interface LoanRequestStatistics {
  totalRequests: number;
  requestsByStatus: Record<LoanRequestStatus, number>;
}
