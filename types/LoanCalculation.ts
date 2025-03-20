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
  interestRate: number;
  monthlyGpsFee: number;
  closingCosts: number;
  downPaymentPercentage: number;
}
