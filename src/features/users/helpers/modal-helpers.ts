import { User } from 'types/User';

type ModalAction = 'delete' | 'restore' | 'resendEmail' | null;
type ModalIntent = 'delete' | 'restore' | 'default';

interface ModalProperties {
  title: string;
  description: string;
  confirmLabel: string;
  intent: ModalIntent;
}

/**
 * Get modal properties based on the current action and selected user
 * @param action The current modal action ('delete', 'restore', or 'resendEmail')
 * @param user The selected user to act upon
 * @returns Modal properties configuration object
 */
export function getUserModalProps(
  action: ModalAction,
  user: User | null
): ModalProperties {
  if (action === 'delete' && user) {
    return {
      title: 'Eliminar Usuario',
      description: `¿Está seguro que desea eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      intent: 'delete'
    };
  } else if (action === 'restore' && user) {
    return {
      title: 'Restaurar Usuario',
      description: `¿Está seguro que desea restaurar al usuario "${user.name}"?`,
      confirmLabel: 'Restaurar',
      intent: 'restore'
    };
  } else if (action === 'resendEmail' && user) {
    return {
      title: 'Reenviar Enlace de Contraseña',
      description: `¿Está seguro que desea reenviar el enlace para establecer contraseña al usuario "${user.name}"?`,
      confirmLabel: 'Reenviar',
      intent: 'default'
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
