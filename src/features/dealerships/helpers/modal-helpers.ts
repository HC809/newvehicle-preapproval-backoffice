import { Dealership } from 'types/Dealerships';

type ModalAction = 'delete' | 'restore' | null;
type ModalIntent = 'delete' | 'restore' | 'default';

interface ModalProperties {
  title: string;
  description: string;
  confirmLabel: string;
  intent: ModalIntent;
}

/**
 * Get modal properties based on the current action and selected dealership
 * @param action The current modal action ('delete' or 'restore')
 * @param dealership The selected dealership to act upon
 * @returns Modal properties configuration object
 */
export function getDealershipModalProps(
  action: ModalAction,
  dealership: Dealership | null
): ModalProperties {
  if (action === 'delete' && dealership) {
    return {
      title: 'Eliminar Concesionaria',
      description: `¿Está seguro que desea eliminar la concesionaria "${dealership.name}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      intent: 'delete'
    };
  } else if (action === 'restore' && dealership) {
    return {
      title: 'Restaurar Concesionaria',
      description: `¿Está seguro que desea restaurar la concesionaria "${dealership.name}"?`,
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
