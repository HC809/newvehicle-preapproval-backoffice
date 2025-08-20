import { UserRole } from 'types/User';

export const translateRole: Record<UserRole, string> = {
  [UserRole.IT_Admin]: 'Administrador de IT',
  [UserRole.BusinessDevelopment_Admin]: 'Gerente de Vehículos Nuevos',
  [UserRole.BusinessDevelopment_User]: 'Oficial de Vehículos Nuevos',
  [UserRole.Dealership_Admin]: 'Asesor de Concesionaria',
  [UserRole.PYMEAdvisor]: 'Asesor PYME',
  [UserRole.BranchManager]: 'Gerente de Agencia',
  [UserRole.ContactCenterAgent]: 'Agente de Contact Center',
  [UserRole.FinancialAdvisor]: 'Asesor Financiero'
};
