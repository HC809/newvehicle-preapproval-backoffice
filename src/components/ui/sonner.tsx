'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme();

  // Use resolvedTheme which is more reliable than theme
  const isDarkTheme = resolvedTheme === 'dark';

  return (
    <Sonner
      theme={isDarkTheme ? 'dark' : 'light'}
      position='top-right'
      expand={false}
      richColors
      closeButton
      className='toaster group'
      toastOptions={{
        classNames: {
          toast: 'group toast',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground'
        },
        duration: 3000
      }}
      {...props}
    />
  );
};

export { Toaster };
