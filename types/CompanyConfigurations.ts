export interface CompanyConfigurationForm {
  dollarExchangeRate: number;
  interestRate: number;
  monthlyGpsFee: number;
  closingCosts: number;
  vehicleInsuranceRateUnder3_5T: number;
  vehicleInsuranceRateOver3_5T: number;
  minDownPaymentPercentage: number;
}

export interface CompanyConfiguration extends CompanyConfigurationForm {
  id: string;
  createdAt: string;
}

export type CreateCompanyConfigurationForm = CompanyConfigurationForm;
