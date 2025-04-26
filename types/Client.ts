import { IncomeType } from './LoanRequests';

export interface Client {
  id: string;
  name: string;
  dni: string;
  lastRiskScore: number;
  city: string;
  email: string;
  phoneNumber: string;
  residentialAddress: string;
  incomeType: IncomeType | null;
  createdAt: string;
  updatedAt: string;
}
