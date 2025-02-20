import { VerificationType } from 'types/User';

export const verificationTypeTranslations: Record<VerificationType, string> = {
  [VerificationType.ActiveDirectory]: 'Active Directory',
  [VerificationType.Backoffice]: 'Credenciales'
};
