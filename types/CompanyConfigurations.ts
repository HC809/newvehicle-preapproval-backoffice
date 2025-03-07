export interface CompanyConfigurationForm {
  dollarExchangeRate: number;
  interestRate: number;
}

export interface CompanyConfiguration extends CompanyConfigurationForm {
  id: string;
  createdAt: string;
}

export type CreateCompanyConfigurationForm = CompanyConfigurationForm;
