import { VerificationType } from 'types/User';

export const translateVerificationType: Record<VerificationType, string> = {
  [VerificationType.ActiveDirectory]: 'Active Directory',
  [VerificationType.Backoffice]: 'Credenciales'
};
