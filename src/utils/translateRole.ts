import { UserRole } from 'types/User';

export const translateRole: Record<UserRole, string> = {
  [UserRole.IT_Admin]: 'Administrador de IT',
  [UserRole.BusinessDevelopment_Admin]: 'Gerente de Oficial de Negocio',
  [UserRole.BusinessDevelopment_User]: 'Oficial de Negocio',
  [UserRole.Dealership_Admin]: 'Asesor de Concesionaria',
  [UserRole.PYMEAdvisor]: 'Asesor Pyme',
  [UserRole.BranchManager]: 'Gerente de Agencia'
};
