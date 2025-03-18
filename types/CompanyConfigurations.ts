export interface CompanyConfigurationForm {
  dollarExchangeRate: number;
  interestRate: number;
  monthlyGpsFee: number;
  closingCosts: number;
}

export interface CompanyConfiguration extends CompanyConfigurationForm {
  id: string;
  createdAt: string;
}

export type CreateCompanyConfigurationForm = CompanyConfigurationForm;
