'use client';

import React, { useEffect, useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from './ChatContext';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { ChatInterface } from './ChatInterface';
import { ChatParticipant } from 'types/LoanRequests';

export interface ChatButtonProps extends ButtonProps {
  loanRequestId: string;
  participants: ChatParticipant[];
}

export function ChatButton({
  loanRequestId,
  participants,
  className,
  variant = 'outline',
  ...props
}: ChatButtonProps) {
  const [open, setOpen] = useState(false);
  const { isConnected } = useChat();

  // Manejar la apertura/cierre del chat
  const handleToggleChat = () => {
    setOpen(!open);
  };

  // Cerrar el chat cuando cambia el ID de la solicitud
  useEffect(() => {
    setOpen(false);
  }, [loanRequestId]);

  return (
    <>
      <Button
        onClick={handleToggleChat}
        variant={variant}
        className={cn('relative', className)}
        {...props}
      >
        <MessageSquare className='mr-2 h-4 w-4' />
        <span>Chat</span>
        {!isConnected && (
          <span className='absolute -right-1 -top-1 h-2 w-2 rounded-full bg-amber-500'></span>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen} modal={true}>
        <SheetContent
          className='flex w-full max-w-md flex-col p-0 sm:max-w-lg md:max-w-xl lg:max-w-xl [&>button]:hidden'
          style={{ height: '100vh' }}
          side='right'
          onInteractOutside={(e) => e.preventDefault()}
        >
          <SheetTitle className='sr-only'>Chat de Solicitud</SheetTitle>

          {/* Contenedor principal que ocupa todo el alto disponible restante */}
          <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
            <ChatInterface
              loanRequestId={loanRequestId}
              participants={participants}
              onClose={() => setOpen(false)}
              className='h-full'
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
