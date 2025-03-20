// Función para deshabilitar el resaltado de elementos focusados
export const disableTabHighlight = (): { cleanup: () => void } => {
  // Crear el elemento style
  const style = document.createElement('style');
  style.innerHTML = `
    [data-state="active"] {
      outline: none !important;
      box-shadow: none !important;
      border-color: transparent !important;
    }
    
    *:focus, *:focus-visible {
      outline: none !important;
      box-shadow: none !important;
      border-color: transparent !important;
    }
  `;

  // Agregar el estilo al documento
  document.head.appendChild(style);

  // Función para manejar el evento keydown
  const handleKeyDown = () => {
    if (document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }
  };

  // Agregar el event listener
  document.addEventListener('keydown', handleKeyDown);

  // Retornar función de limpieza
  return {
    cleanup: () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.head.removeChild(style);
    }
  };
};
