import { IncomeType } from './LoanRequests';
import { LoanRequest } from './LoanRequests';
import { LoanDocument } from './LoanDocument';

export interface Client {
  id: string;
  name: string;
  dni: string;
  lastRiskScore: number;
  city: string;
  email: string | null;
  phoneNumber: string;
  residentialAddress: string;
  incomeType: IncomeType | null;
  createdAt: string;
  updatedAt: string;
  loanRequests?: LoanRequest[];
  documents?: LoanDocument[];
}
