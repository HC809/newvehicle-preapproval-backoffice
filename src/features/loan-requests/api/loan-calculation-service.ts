import { useMutation } from '@tanstack/react-query';
import { AxiosInstance } from 'axios';

export interface LoanCalculation {
  totalVehicleValue: number;
  downPaymentValue: number;
  requestedLoanAmount: number;
  maximumPaymentCapacity: number;
  loanToValueRatio: number;
  monthlyPayment: number;
  lifeAndAccidentInsurance: number;
  vehicleInsurance: number;
  totalMonthlyPayment: number;
  paymentToIncomeRounded: number;
  paymentToIncomePercentage: number;
  vehicleInsuranceTax: number;
}

export const useCalculateLoan = (apiClient: AxiosInstance) => {
  return useMutation({
    mutationFn: async (loanRequestId: string) => {
      const response = await apiClient.post(
        `/loan-calculations/calculate/${loanRequestId}`
      );
      return response.data;
    }
  });
};
