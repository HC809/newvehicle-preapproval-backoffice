'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';

export interface InputNumberDecimalProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'
  > {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  decimalPlaces?: number;
}

const InputNumberDecimal = React.forwardRef<
  HTMLInputElement,
  InputNumberDecimalProps
>(
  (
    {
      className,
      value,
      onChange,
      min,
      max,
      step = 0.01,
      decimalPlaces = 2,
      ...props
    },
    ref
  ) => {
    // Mantener el valor como string para la edición
    const [inputValue, setInputValue] = React.useState<string>(
      value.toFixed(decimalPlaces)
    );

    // Actualizar el inputValue cuando cambia el valor externo
    React.useEffect(() => {
      setInputValue(value.toFixed(decimalPlaces));
    }, [value, decimalPlaces]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newInputValue = e.target.value;

      // Permitir entrada vacía o solo punto decimal
      if (newInputValue === '' || newInputValue === '.') {
        setInputValue(newInputValue);
        return;
      }

      // Validar que sea un número válido con formato de punto decimal
      const regex = /^-?\d*\.?\d*$/;
      if (!regex.test(newInputValue)) {
        return;
      }

      setInputValue(newInputValue);

      // Convertir a número para el onChange
      const numericValue = parseFloat(newInputValue);

      // Solo llamar a onChange si es un número válido
      if (!isNaN(numericValue)) {
        // Aplicar restricciones de min/max
        if (min !== undefined && numericValue < min) {
          onChange(min);
          return;
        }

        if (max !== undefined && numericValue > max) {
          onChange(max);
          return;
        }

        onChange(numericValue);
      }
    };

    // Cuando el input pierde el foco, formatear el valor
    const handleBlur = () => {
      const numericValue = parseFloat(inputValue);

      if (isNaN(numericValue)) {
        // Si no es un número válido, restaurar al valor mínimo o 0
        const defaultValue = min !== undefined ? min : 0;
        setInputValue(defaultValue.toFixed(decimalPlaces));
        onChange(defaultValue);
      } else {
        // Formatear con el número correcto de decimales
        setInputValue(numericValue.toFixed(decimalPlaces));
        onChange(numericValue);
      }
    };

    return (
      <Input
        type='text'
        className={cn(className)}
        ref={ref}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
      />
    );
  }
);

InputNumberDecimal.displayName = 'InputNumberDecimal';

export { InputNumberDecimal };
