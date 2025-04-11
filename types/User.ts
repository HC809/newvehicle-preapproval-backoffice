export enum UserRole {
  IT_Admin = 'IT_Admin',
  BusinessDevelopment_Admin = 'BusinessDevelopment_Admin',
  BusinessDevelopment_User = 'BusinessDevelopment_User',
  Dealership_Admin = 'Dealership_Admin',
  PYMEAdvisor = 'PYMEAdvisor',
  BranchManager = 'BranchManager'
}

export enum VerificationType {
  Backoffice = 'Backoffice',
  ActiveDirectory = 'ActiveDirectory'
}

export interface UserForm {
  name: string;
  email: string;
  role: UserRole;
  dealershipId: string | null;
  isActive: boolean;
}

export type CreateUserForm = Omit<UserForm, 'isActive'>;

export interface User extends UserForm {
  id: string;
  dealership: string | null;
  password: string;
  verificationType: VerificationType;
  isDeleted: boolean;
}
