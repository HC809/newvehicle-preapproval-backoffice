import React from 'react';

interface InfoItemProps {
  label: string;
  value: string | number | null;
  icon?: React.ReactNode;
  iconColor?: string;
  textColor?: string;
  darkTextColor?: string;
  actionIcon?: React.ReactNode;
}

/**
 * Componente para mostrar información en formato de etiqueta y valor
 */
export const InfoItem = ({
  label,
  value,
  icon,
  iconColor = 'text-muted-foreground',
  textColor = '',
  darkTextColor = '',
  actionIcon
}: InfoItemProps) => (
  <div className='flex items-start space-x-3 py-2'>
    {icon && <div className={`mt-0.5 ${iconColor}`}>{icon}</div>}
    <div>
      <p className='text-sm font-medium text-muted-foreground'>{label}</p>
      <div className='flex items-center'>
        <p className={`text-base font-medium ${textColor} ${darkTextColor}`}>
          {value || 'No disponible'}
        </p>
        {actionIcon}
      </div>
    </div>
  </div>
);
