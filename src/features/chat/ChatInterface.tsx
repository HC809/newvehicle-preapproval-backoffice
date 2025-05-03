'use client';

import { useEffect, useRef, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useChatMessages, useSendMessage } from './api/chat-service';
import { useToken } from '@/features/auth/TokenContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatInterfaceProps {
  roomId: string;
  title?: string;
  className?: string;
}

export function ChatInterface({
  roomId,
  title,
  className
}: ChatInterfaceProps) {
  const { username } = useToken();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');

  // Cargar mensajes para esta sala
  const { data: messages = [], isLoading, isError } = useChatMessages(roomId);

  // Mutación para enviar mensaje
  const sendMessage = useSendMessage();

  // Desplazarse al último mensaje cuando se cargan nuevos mensajes
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Procesar el envío de un nuevo mensaje
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId) return;

    try {
      await sendMessage.mutateAsync({ roomId, content: newMessage });
      setNewMessage('');
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  };

  // Formatear fecha
  const formatMessageDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es
      });
    } catch (e) {
      return 'Fecha desconocida';
    }
  };

  // Obtener iniciales para avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Encabezado del chat */}
      <div className='border-b p-3'>
        <h3 className='font-medium'>{title || 'Chat'}</h3>
      </div>

      {/* Área de mensajes */}
      <div ref={scrollRef} className='flex-1 space-y-4 overflow-y-auto p-4'>
        {isLoading ? (
          <div className='flex h-full items-center justify-center'>
            <p className='text-muted-foreground'>Cargando mensajes...</p>
          </div>
        ) : isError ? (
          <div className='flex h-full items-center justify-center'>
            <p className='text-destructive'>Error al cargar los mensajes</p>
          </div>
        ) : messages.length === 0 ? (
          <div className='flex h-full items-center justify-center'>
            <p className='text-muted-foreground'>No hay mensajes aún</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderName === username;

            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2',
                  isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <Avatar className='h-8 w-8'>
                  <AvatarFallback>
                    {getInitials(message.senderName)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2',
                    isOwnMessage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <div className='flex flex-col gap-1'>
                    <p className='text-xs font-medium'>
                      {isOwnMessage ? 'Tú' : message.senderName}
                    </p>
                    <p className='break-words'>{message.content}</p>
                    <p className='text-right text-[10px] opacity-70'>
                      {formatMessageDate(message.sentAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Separator />

      {/* Área de entrada de mensaje */}
      <form onSubmit={handleSendMessage} className='flex gap-2 p-3'>
        <Input
          placeholder='Escribe un mensaje...'
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className='flex-1'
        />
        <Button
          type='submit'
          size='icon'
          disabled={!newMessage.trim() || sendMessage.isPending}
        >
          <SendHorizontal className='h-4 w-4' />
        </Button>
      </form>
    </div>
  );
}
