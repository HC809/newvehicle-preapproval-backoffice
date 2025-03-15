import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from './button';

interface FullPageLoaderProps {
  message?: string;
  subMessage?: string;
  error?: string | null;
  onRetry?: () => void;
  onClose?: () => void;
}

export const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  message = 'Procesando solicitud...',
  subMessage = 'Por favor espere mientras completamos el proceso.',
  error = null,
  onRetry,
  onClose
}) => {
  // Estado para simular progreso
  const [progress, setProgress] = useState(0);

  // Efecto para simular progreso cuando no hay error
  useEffect(() => {
    if (error) return;

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        // Incrementar gradualmente, pero nunca llegar al 100% hasta que se complete
        if (prevProgress < 90) {
          return prevProgress + (90 - prevProgress) * 0.1;
        }
        return prevProgress;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [error]);

  // Resetear el progreso cuando cambia el mensaje
  useEffect(() => {
    setProgress(0);
  }, [message]);

  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm'>
      <div className='mx-4 flex w-full max-w-md flex-col items-center justify-center space-y-4 rounded-lg border bg-card p-8 shadow-lg'>
        {error ? (
          <>
            <div className='relative'>
              <AlertCircle className='h-14 w-14 text-destructive' />
            </div>

            <div className='space-y-2 text-center'>
              <p className='text-xl font-semibold text-destructive'>Error</p>
              <p className='text-sm text-muted-foreground'>{error}</p>
            </div>

            <div className='mt-4 flex gap-3'>
              {onRetry && (
                <Button variant='outline' onClick={onRetry}>
                  Reintentar
                </Button>
              )}
              <Button
                variant={onRetry ? 'default' : 'outline'}
                onClick={onClose}
              >
                {onRetry ? 'Cancelar' : 'Cerrar'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className='relative'>
              <Loader2 className='h-14 w-14 animate-spin text-primary' />
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='h-3 w-3 rounded-full bg-primary'></div>
              </div>
            </div>

            <div className='space-y-2 text-center'>
              <p className='text-xl font-semibold'>{message}</p>
              <p className='text-sm text-muted-foreground'>{subMessage}</p>
            </div>

            <div className='mt-4 w-full'>
              <div className='mb-1 flex items-center justify-between text-xs'>
                <span>Progreso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className='h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                <div
                  className='h-full rounded-full bg-primary transition-all duration-300 ease-out'
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
