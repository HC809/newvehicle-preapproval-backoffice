import { UserRole } from 'types/User';

export const roleTranslations: Record<UserRole, string> = {
  [UserRole.IT_Admin]: 'Administrador de IT',
  [UserRole.BusinessDevelopment_Admin]: 'Gerente de Oficial de Negocio',
  [UserRole.BusinessDevelopment_User]: 'Oficial de Negocio',
  [UserRole.Dealership_Admin]: 'Administrador de Concesionaria'
};
