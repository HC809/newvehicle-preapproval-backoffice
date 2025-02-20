export enum UserRole {
  IT_Admin = 'IT_Admin',
  BusinessDevelopment_Admin = 'BusinessDevelopment_Admin',
  BusinessDevelopment_User = 'BusinessDevelopment_User',
  Dealership_Admin = 'Dealership_Admin'
}

export enum VerificationType {
  Backoffice = 'Backoffice',
  ActiveDirectory = 'ActiveDirectory'
}

export interface User {
  id: string;
  name: string;
  email: string;
  dealership: string;
  password: string;
  role: UserRole;
  verificationType: VerificationType;
  isActive: boolean;
}
