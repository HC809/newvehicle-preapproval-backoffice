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
    case LoanRequestStatus.ApprovedForCommittee:
      return 'success';
    case LoanRequestStatus.RejectedByAgent:
    case LoanRequestStatus.RejectedByManager:
      return 'destructive';
    case LoanRequestStatus.AcceptedByCustomer:
      return 'default';
    case LoanRequestStatus.VisitAssigned:
    case LoanRequestStatus.VisitRegistered:
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
    case LoanRequestStatus.Pending:
      return 'bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700';
    case LoanRequestStatus.ApprovedByAgent:
      return 'bg-white text-green-700 border-2 border-green-700 hover:bg-green-50 dark:bg-gray-800 dark:text-green-500 dark:border-green-500 dark:hover:bg-gray-700';
    case LoanRequestStatus.ApprovedByManager:
      return 'bg-green-700 text-white hover:bg-green-800 dark:bg-green-800 dark:hover:bg-green-900';
    case LoanRequestStatus.ApprovedForCommittee:
      return 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800';
    case LoanRequestStatus.RejectedByAgent:
      return 'bg-white text-red-700 border-2 border-red-700 hover:bg-red-50 dark:bg-gray-800 dark:text-red-500 dark:border-red-500 dark:hover:bg-gray-700';
    case LoanRequestStatus.RejectedByManager:
      return 'bg-red-700 text-white hover:bg-red-800 dark:bg-red-800 dark:hover:bg-red-900';
    case LoanRequestStatus.AcceptedByCustomer:
      return 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-500 dark:border-blue-500 dark:hover:bg-gray-700';
    case LoanRequestStatus.VisitAssigned:
      return 'bg-white text-purple-700 border-2 border-purple-700 hover:bg-purple-50 dark:bg-gray-800 dark:text-purple-500 dark:border-purple-500 dark:hover:bg-gray-700';
    case LoanRequestStatus.VisitRegistered:
      return 'bg-purple-800 text-white hover:bg-purple-900 dark:bg-purple-900 dark:hover:bg-purple-950';
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
    case LoanRequestStatus.VisitRegistered:
      return 'Visita Registrada';
    case LoanRequestStatus.ApprovedForCommittee:
      return 'Aprobado para Comité';
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
