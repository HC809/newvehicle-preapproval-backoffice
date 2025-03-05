'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';

export interface InputNumberProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'
  > {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  ({ className, value, onChange, min, max, step = 1, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value === '' ? 0 : parseInt(e.target.value, 10);

      if (isNaN(newValue)) {
        return;
      }

      if (min !== undefined && newValue < min) {
        onChange(min);
        return;
      }

      if (max !== undefined && newValue > max) {
        onChange(max);
        return;
      }

      onChange(newValue);
    };

    return (
      <Input
        type='number'
        className={cn(className)}
        ref={ref}
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        {...props}
      />
    );
  }
);

InputNumber.displayName = 'InputNumber';

export { InputNumber };
