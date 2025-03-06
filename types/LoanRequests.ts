export interface LoanRequest {
  id: string;
  dealershipId: string;
  dealershipName: string;
  dni: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  requestedLoanTermMonths: number;
  approvedLoanTermMonths: number;
  requestedAmount: number;
  appliedInterestRate: number;
  dollarExchangeRate: number;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  monthlyIncome: number | null;
  city: string;
  comment: string;
  status: string;
  rejectionReason: string | null;
}

export interface LoanRequestListingParams {
  viewAll?: boolean;
}
