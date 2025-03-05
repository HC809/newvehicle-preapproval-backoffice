import { VehicleType } from 'types/VehicleTypes';

type ModalAction = 'delete' | 'restore' | null;
type ModalIntent = 'delete' | 'restore' | 'default';

interface ModalProperties {
  title: string;
  description: string;
  confirmLabel: string;
  intent: ModalIntent;
}

/**
 * Get modal properties based on the current action and selected vehicle type
 * @param action The current modal action ('delete' or 'restore')
 * @param vehicleType The selected vehicle type to act upon
 * @returns Modal properties configuration object
 */
export function getVehicleTypeModalProps(
  action: ModalAction,
  vehicleType: VehicleType | null
): ModalProperties {
  if (action === 'delete' && vehicleType) {
    return {
      title: 'Eliminar Tipo de Vehículo',
      description: `¿Está seguro que desea eliminar el tipo de vehículo "${vehicleType.name}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      intent: 'delete'
    };
  } else if (action === 'restore' && vehicleType) {
    return {
      title: 'Restaurar Tipo de Vehículo',
      description: `¿Está seguro que desea restaurar el tipo de vehículo "${vehicleType.name}"?`,
      confirmLabel: 'Restaurar',
      intent: 'restore'
    };
  }

  // Default fallback
  return {
    title: '',
    description: '',
    confirmLabel: 'Continuar',
    intent: 'default'
  };
}
