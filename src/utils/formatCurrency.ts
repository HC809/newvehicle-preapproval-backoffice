/**
 * Formatea un valor numérico como moneda
 * @param amount - Cantidad a formatear
 * @param currencyType - Tipo de moneda ('ARS', 'USD', 'HNL')
 * @param options - Opciones adicionales de formato
 * @returns Cadena formateada con el símbolo de moneda
 */
export const formatCurrency = (
  amount: number | null,
  currencyType: 'ARS' | 'USD' | 'HNL' = 'ARS',
  options: Partial<{
    maximumFractionDigits: number;
    minimumFractionDigits: number;
  }> = {}
): string => {
  if (amount === null) return 'No disponible';

  const defaultOptions = {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    ...options
  };

  return new Intl.NumberFormat('es', {
    style: 'currency',
    currency: currencyType,
    maximumFractionDigits: defaultOptions.maximumFractionDigits,
    minimumFractionDigits: defaultOptions.minimumFractionDigits
  }).format(amount);
};

/**
 * Formatea un valor numérico como pesos argentinos
 */
export const formatARS = (amount: number | null, options = {}): string => {
  return formatCurrency(amount, 'ARS', options);
};

/**
 * Formatea un valor numérico como dólares estadounidenses
 */
export const formatUSD = (amount: number | null, options = {}): string => {
  return formatCurrency(amount, 'USD', options);
};

/**
 * Formatea un valor numérico como lempiras hondureñas
 */
export const formatHNL = (amount: number | null, options = {}): string => {
  return formatCurrency(amount, 'HNL', options);
};
