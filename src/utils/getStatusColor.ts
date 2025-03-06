/**
 * Obtiene la clase CSS para el color del badge según el estado de la solicitud
 * @param status - Estado de la solicitud (aprobado, rechazado, pendiente, etc.)
 * @returns Clase CSS para el color del badge
 */
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'aprobado':
    case 'approved':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'rechazado':
    case 'rejected':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'pendiente':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'en revisión':
    case 'in review':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

/**
 * Traduce el estado de la solicitud al español
 * @param status - Estado de la solicitud en inglés o español
 * @returns Estado traducido al español
 */
export const translateStatus = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'Aprobado';
    case 'rejected':
      return 'Rechazado';
    case 'pending':
      return 'Pendiente';
    case 'in review':
      return 'En Revisión';
    default:
      // Si ya está en español o es un estado desconocido, devolver el mismo valor
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
};
