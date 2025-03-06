/**
 * Formatea un GUID para hacerlo más amigable para el usuario
 * @param guid - GUID completo (ej: "0195697a-cf08-7139-b91a-11bae30cc658")
 * @returns GUID formateado (ej: "SOL-7139-B91A")
 */
export const formatLoanRequestId = (guid: string): string => {
  if (!guid) return 'ID no disponible';

  // Extraer partes significativas del GUID
  const parts = guid.split('-');
  if (parts.length < 3) return `SOL-${guid.substring(0, 8)}`;

  // Usar la tercera y cuarta parte del GUID (normalmente son más distintivas)
  const segment1 = parts[2].toUpperCase();
  const segment2 = parts[3].toUpperCase();

  return `SOL-${segment1}-${segment2}`;
};

/**
 * Formatea un GUID para mostrar solo los últimos caracteres
 * @param guid - GUID completo
 * @param length - Número de caracteres a mostrar (por defecto 8)
 * @returns Últimos caracteres del GUID
 */
export const formatShortGuid = (guid: string, length: number = 8): string => {
  if (!guid) return 'ID no disponible';

  // Eliminar guiones y tomar los últimos caracteres
  const cleanGuid = guid.replace(/-/g, '');
  return cleanGuid.substring(cleanGuid.length - length).toUpperCase();
};
