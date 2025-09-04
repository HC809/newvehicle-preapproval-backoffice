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

// New types for the status and city endpoint
export interface StatusCityData {
  status: string;
  statusDisplayName: string;
  tegucigalpaCount: number;
  sanPedroSulaCount: number;
  ceibaCount: number;
  unassignedCount: number;
  unidentifiedCount: number;
  totalCount: number;
}

export interface StatusCityStatistics {
  data: StatusCityData[];
  totalRequests: number;
  selectedMonth: string;
}

// New types for the dealership endpoint
export interface DealershipRequestData {
  dealershipName: string;
  totalRequests: number;
  referredUnassignedCount: number;
  regularRequestsCount: number;
}

export interface DealershipRequestStatistics {
  data: DealershipRequestData[];
  totalRequests: number;
  totalReferredUnassigned: number;
  selectedMonth: string;
}

// New types for the manager endpoint
export interface ManagerRequestData {
  managerName: string;
  totalRequests: number;
  referredUnassignedCount: number;
  regularRequestsCount: number;
}

export interface ManagerRequestStatistics {
  data: ManagerRequestData[];
  totalRequests: number;
  totalReferredUnassigned: number;
  selectedMonth: string;
}
