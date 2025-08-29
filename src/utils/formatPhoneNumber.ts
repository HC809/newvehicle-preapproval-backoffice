/**
 * Formatea un número de teléfono de 8 dígitos agregando un guión después de 4 dígitos
 * @param phoneNumber - Número de teléfono de 8 dígitos
 * @returns Número formateado como "XXXX-XXXX" o el número original si no es válido
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber || phoneNumber.length !== 8) {
    return phoneNumber;
  }

  // Verificar que solo contenga dígitos
  if (!/^\d{8}$/.test(phoneNumber)) {
    return phoneNumber;
  }

  // Formatear como XXXX-XXXX
  return `${phoneNumber.substring(0, 4)}-${phoneNumber.substring(4, 8)}`;
};
