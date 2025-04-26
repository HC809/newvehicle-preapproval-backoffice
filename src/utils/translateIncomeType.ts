import { IncomeType } from 'types/LoanRequests';

/**
 * Traduce el tipo de ingreso al español
 * @param incomeType - Tipo de ingreso
 * @returns Tipo de ingreso traducido al español
 */
export const translateIncomeType = (incomeType: IncomeType | null): string => {
  if (!incomeType) return 'No especificado';

  switch (incomeType) {
    case IncomeType.Salaried:
      return 'Empleado con salario fijo';
    case IncomeType.BusinessOwner:
      return 'Dueño de negocio propio / Comerciante';
    case IncomeType.Both:
      return 'Ambos (Empleado y Dueño de negocio)';
    default:
      return String(incomeType);
  }
};
