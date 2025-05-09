import { LoanRequestStatus } from 'types/LoanRequests';

/**
 * Obtiene la variante del badge según el estado de la solicitud
 * @param status - Estado de la solicitud
 * @returns Variante del badge (success, destructive, warning, default, secondary)
 */
export const getStatusVariant = (
  status: LoanRequestStatus
): 'success' | 'destructive' | 'warning' | 'default' | 'secondary' => {
  switch (status) {
    case LoanRequestStatus.ApprovedByAgent:
    case LoanRequestStatus.ApprovedByManager:
      return 'success';
    case LoanRequestStatus.RejectedByAgent:
    case LoanRequestStatus.RejectedByManager:
      return 'destructive';
    case LoanRequestStatus.AcceptedByCustomer:
      return 'default';
    case LoanRequestStatus.VisitAssigned:
      return 'secondary';
    case LoanRequestStatus.DeclinedByCustomer:
      return 'secondary';
    case LoanRequestStatus.Pending:
    case LoanRequestStatus.BranchManagerReview:
      return 'warning';
    case LoanRequestStatus.Cancelled:
      return 'default';
    default:
      return 'default';
  }
};

/**
 * Obtiene las clases CSS para el color del badge según el estado de la solicitud
 * @param status - Estado de la solicitud
 * @returns Clases CSS para el color del badge
 */
export const getStatusClassName = (status: LoanRequestStatus): string => {
  switch (status) {
    case LoanRequestStatus.ApprovedByManager:
      return 'bg-green-700 text-white hover:bg-green-800 dark:bg-green-800 dark:hover:bg-green-900';
    case LoanRequestStatus.RejectedByManager:
      return 'bg-red-700 text-white hover:bg-red-800 dark:bg-red-800 dark:hover:bg-red-900';
    case LoanRequestStatus.AcceptedByCustomer:
      return 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800';
    case LoanRequestStatus.VisitAssigned:
      return 'bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800';
    case LoanRequestStatus.DeclinedByCustomer:
      return 'bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700';
    case LoanRequestStatus.BranchManagerReview:
      return 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800';
    default:
      return '';
  }
};

/**
 * Traduce el estado de la solicitud al español
 * @param status - Estado de la solicitud
 * @returns Estado traducido al español
 */
export const translateStatus = (status: LoanRequestStatus): string => {
  switch (status) {
    case LoanRequestStatus.Pending:
      return 'Pendiente de Revisión';
    case LoanRequestStatus.ApprovedByAgent:
      return 'Aprobado Oficial Neg.';
    case LoanRequestStatus.RejectedByAgent:
      return 'Rechazado Oficial Neg.';
    case LoanRequestStatus.ApprovedByManager:
      return 'Aprobado Gerente Neg.';
    case LoanRequestStatus.RejectedByManager:
      return 'Rechazado Gerente Neg.';
    case LoanRequestStatus.AcceptedByCustomer:
      return 'Aceptado por Cliente';
    case LoanRequestStatus.VisitAssigned:
      return 'Visita Asignada';
    case LoanRequestStatus.DeclinedByCustomer:
      return 'Cliente Desistió';
    case LoanRequestStatus.Cancelled:
      return 'Cancelado';
    case LoanRequestStatus.BranchManagerReview:
      return 'Revisión Gerente Agencia';
    default:
      return status;
  }
};
