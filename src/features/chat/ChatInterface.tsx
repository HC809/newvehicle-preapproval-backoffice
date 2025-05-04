'use client';

import React, { useEffect, useRef, useState } from 'react';
import { SendHorizontal, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  useChatMessages,
  useSendMessage,
  ChatParticipant
} from './api/chat-service';
import { useChat } from './ChatContext';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

interface ChatInterfaceProps {
  loanRequestId: string;
  title?: string;
  className?: string;
  participants: ChatParticipant[];
  onClose?: () => void;
}

export function ChatInterface({
  loanRequestId,
  title,
  className,
  participants,
  onClose
}: ChatInterfaceProps) {
  // Referencias y estado
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionText, setMentionText] = useState('');
  const [selectedParticipant, setSelectedParticipant] =
    useState<ChatParticipant | null>(null);

  // Obtener datos de sesión del usuario
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Cargar mensajes para este loanRequest
  const {
    data: messages = [],
    isLoading,
    isError
  } = useChatMessages(loanRequestId);

  // Obtener función para enviar mensajes del contexto
  const { sendMessage, isConnected } = useChat();

  // Determinar si hay participantes disponibles
  const hasParticipants = participants.length > 0;

  // Desplazarse al último mensaje cuando se cargan nuevos mensajes
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Manejar la selección de un participante para mencionar
  const handleSelectParticipant = (participant: ChatParticipant) => {
    setSelectedParticipant(participant);
    setMentionOpen(false);
    setMentionText('');

    // Enfocar el input después de seleccionar
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Manejar el keydown para detectar @ para menciones
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '@' && !selectedParticipant) {
      e.preventDefault(); // Prevenir que el @ se escriba en el input
      setMentionOpen(true);
      setMentionText('');
    }
  };

  // Limpiar la selección de participante
  const clearSelectedParticipant = () => {
    setSelectedParticipant(null);
  };

  // Procesar el envío de un nuevo mensaje
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !loanRequestId || !selectedParticipant) return;

    try {
      // Deshabilitar temporalmente mientras enviamos
      const sendingButton = document.querySelector('button[type="submit"]');
      if (sendingButton) {
        sendingButton.setAttribute('disabled', 'true');
      }

      await sendMessage({
        loanRequestId,
        content: newMessage,
        receiverUserId: selectedParticipant.id,
        receiverUserName: selectedParticipant.name
      });

      setNewMessage('');
      setSelectedParticipant(null);

      // Re-habilitar el botón
      if (sendingButton) {
        sendingButton.removeAttribute('disabled');
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);

      // Re-habilitar el botón en caso de error
      const sendingButton = document.querySelector('button[type="submit"]');
      if (sendingButton) {
        sendingButton.removeAttribute('disabled');
      }
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
    if (!name) return '??';
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
        <h3 className='font-medium'>{title || 'Chat grupal'}</h3>
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
            const isOwnMessage = message.senderId === userId;

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
                    <div className='flex justify-between text-xs font-medium'>
                      <span>{isOwnMessage ? 'Tú' : message.senderName}</span>
                      {message.receiverId && !isOwnMessage && (
                        <span className='ml-2 opacity-70'>
                          para{' '}
                          {message.receiverId === userId
                            ? 'ti'
                            : message.receiverName || 'Alguien'}
                        </span>
                      )}
                    </div>
                    <p className='break-words'>{message.content}</p>
                    <p className='text-right text-[10px] opacity-70'>
                      {formatMessageDate(message.createdAt)}
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
      <form onSubmit={handleSendMessage} className='flex flex-col gap-2 p-3'>
        {/* Mostrar el destinatario seleccionado */}
        {selectedParticipant && (
          <div className='mb-2 flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm'>
            <span>Para: {selectedParticipant.name}</span>
            <Button
              variant='ghost'
              size='sm'
              className='h-5 w-5 rounded-full p-0'
              onClick={clearSelectedParticipant}
              type='button'
            >
              <X className='h-3 w-3' />
            </Button>
          </div>
        )}

        <div className='flex gap-2'>
          <Input
            ref={inputRef}
            placeholder={
              !hasParticipants
                ? 'No hay participantes disponibles para chatear'
                : selectedParticipant
                  ? `Escribe un mensaje para ${selectedParticipant.name}...`
                  : 'Usa @ para seleccionar un destinatario...'
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className='flex-1'
            disabled={!hasParticipants}
          />

          <Button
            type='submit'
            size='icon'
            disabled={
              !newMessage.trim() || !selectedParticipant || !hasParticipants
            }
          >
            <SendHorizontal className='h-4 w-4' />
          </Button>
        </div>

        {!hasParticipants && (
          <p className='mt-2 text-center text-sm text-muted-foreground'>
            No hay participantes disponibles. Para chatear, debe haber un gestor
            o asesor asignado a esta solicitud.
          </p>
        )}

        {/* Dropdown para menciones */}
        <Popover
          open={mentionOpen && hasParticipants}
          onOpenChange={setMentionOpen}
        >
          <PopoverTrigger asChild>
            <div className='h-0 w-0' aria-hidden='true' />
          </PopoverTrigger>
          <PopoverContent
            className='w-[200px] p-0'
            align='start'
            side='top'
            alignOffset={40}
            sideOffset={10}
          >
            <Command>
              <CommandInput
                placeholder='Buscar persona...'
                className='h-9'
                value={mentionText}
                onValueChange={setMentionText}
                autoFocus
              />
              <CommandList>
                <CommandEmpty>No se encontraron personas</CommandEmpty>
                <CommandGroup>
                  {participants
                    .filter((p) =>
                      p.name.toLowerCase().includes(mentionText.toLowerCase())
                    )
                    .map((participant) => (
                      <CommandItem
                        key={participant.id}
                        value={participant.name}
                        className='cursor-pointer'
                        onSelect={() => handleSelectParticipant(participant)}
                      >
                        <User className='mr-2 h-4 w-4' />
                        <span>{participant.name}</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </form>
    </div>
  );
}
