'use client';

import React, { useEffect, useRef, useState } from 'react';
import { SendHorizontal, X, User, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useChatMessages } from './api/chat-service';
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
import { ChatParticipant } from 'types/LoanRequests';
import { formatLoanRequestId } from '@/utils/formatId';

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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionText, setMentionText] = useState('');
  const [selectedParticipant, setSelectedParticipant] =
    useState<ChatParticipant | null>(null);
  const [filterParticipant, setFilterParticipant] =
    useState<ChatParticipant | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Obtener datos de sesión del usuario
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const userName = session?.user?.name;

  // Cargar mensajes para este loanRequest
  const {
    data: messages = [],
    isLoading,
    isError
  } = useChatMessages(loanRequestId);

  // Log extremadamente claro para entender qué está pasando
  useEffect(() => {
    if (messages.length > 0) {
      messages.forEach((msg) => {});
    }
  }, [messages, userId, userName]);

  // Obtener función para enviar mensajes del contexto
  const { sendMessage } = useChat();

  // Determinar si hay participantes disponibles
  const hasParticipants = participants.length > 0;

  // Desplazarse al último mensaje cuando se cargan nuevos mensajes
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      // Pequeña pausa para asegurar que el contenido se ha renderizado
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages]);

  // Enfocar el input y asegurar visibilidad cuando se abre el chat
  useEffect(() => {
    // Pequeño retraso para asegurar que todo está renderizado
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }

      // Scroll hacia el último mensaje
      if (scrollRef.current && messages.length > 0) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [messages.length]);

  // Asegurar que el área de entrada sea visible cuando cambia el contenido
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current && messages.length === 0) {
        // Si no hay mensajes, asegurar que el área de entrada sea visible
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollIntoView({ behavior: 'auto' });
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [messages.length]);

  // Efecto adicional para manejar cuando el chat se abre por primera vez
  useEffect(() => {
    // Scroll al final cuando el componente se monta
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

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

  // Filtrar mensajes basado en el participante seleccionado
  const filteredMessages = messages.filter((message) => {
    if (!filterParticipant) return true;

    const isMessageFromFilteredParticipant =
      message.senderUserName === filterParticipant.name;
    const isMessageToFilteredParticipant =
      message.receiverUserId === filterParticipant.id;

    return isMessageFromFilteredParticipant || isMessageToFilteredParticipant;
  });

  return (
    <div className={cn('flex h-full w-full flex-col', className)}>
      {/* Filtro de participantes */}
      <div className='border-b p-3'>
        <div className='flex items-center justify-between'>
          <h3 className='font-bold'>
            Chat {formatLoanRequestId(loanRequestId)}
          </h3>
          <div className='flex items-center gap-2'>
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-[200px] justify-between'
                >
                  {filterParticipant
                    ? `Filtrando: ${filterParticipant.name}`
                    : 'Filtrar por participante'}
                  <User className='h-4 w-4' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[200px] p-0'>
                <Command>
                  <CommandInput placeholder='Buscar participante...' />
                  <CommandList>
                    <CommandEmpty>No se encontraron participantes</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setFilterParticipant(null);
                          setFilterOpen(false);
                        }}
                        className='cursor-pointer'
                      >
                        <span>Mostrar todos</span>
                      </CommandItem>
                      {participants.map((participant) => (
                        <CommandItem
                          key={participant.id}
                          onSelect={() => {
                            setFilterParticipant(participant);
                            setFilterOpen(false);
                          }}
                          className='cursor-pointer'
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
            {onClose && (
              <Button variant='ghost' size='icon' onClick={onClose}>
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Container principal para el contenido del chat con flexbox que empuja el input al final */}
      <div className='flex h-full w-full flex-col overflow-hidden'>
        {/* Área de mensajes con scroll, debe expandirse para llenar el espacio disponible */}
        <div
          ref={scrollRef}
          className='flex flex-1 flex-col overflow-y-auto p-4 pb-5'
          style={{ minHeight: '100px' }}
        >
          {isLoading ? (
            <div className='flex h-full items-center justify-center'>
              <p className='text-muted-foreground'>Cargando mensajes...</p>
            </div>
          ) : isError ? (
            <div className='flex h-full items-center justify-center'>
              <p className='text-destructive'>Error al cargar los mensajes</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className='flex h-full items-center justify-center'>
              <p className='text-muted-foreground'>
                {filterParticipant
                  ? `No hay mensajes con ${filterParticipant.name}`
                  : 'No hay mensajes aún'}
              </p>
            </div>
          ) : (
            // Contenedor principal de mensajes con margen auto arriba para empujar todo hacia abajo
            <div className='mt-auto flex w-full flex-col space-y-4'>
              {filteredMessages.map((message) => {
                // Determinar si el mensaje es del usuario actual comparando por NOMBRE
                const isMyMessage = userName === message.senderUserName;

                return (
                  <div
                    key={message.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                      width: '100%',
                      marginBottom: '12px'
                    }}
                  >
                    {/* Bloque de mensaje con estilos fijos */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: isMyMessage ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        gap: '8px',
                        maxWidth: '80%'
                      }}
                    >
                      {/* Avatar */}
                      <div className='flex-shrink-0'>
                        <Avatar className='h-8 w-8'>
                          <AvatarFallback>
                            {getInitials(message.senderUserName)}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Contenido del mensaje */}
                      <div
                        style={{
                          backgroundColor: isMyMessage
                            ? 'hsl(var(--primary))'
                            : message.senderUserId === 'system'
                              ? '#f5f5f5'
                              : `hsl(${Math.abs(message.senderUserId.charCodeAt(0) * 10) % 360}, 70%, 95%)`,
                          color: isMyMessage ? 'white' : 'black',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          marginLeft: isMyMessage ? '0' : '0',
                          marginRight: isMyMessage ? '0' : '0'
                        }}
                      >
                        {/* Nombre del remitente */}
                        <div
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            marginBottom: '4px',
                            textAlign: isMyMessage ? 'right' : 'left'
                          }}
                        >
                          {isMyMessage ? 'Tú' : message.senderUserName}
                          {message.receiverUserId && (
                            <span style={{ marginLeft: '6px', opacity: '0.7' }}>
                              para{' '}
                              {message.receiverUserId === userId
                                ? 'ti'
                                : message.receiverUserName || 'Alguien'}
                            </span>
                          )}
                        </div>

                        {/* Contenido del mensaje */}
                        <div
                          style={{
                            wordBreak: 'break-word',
                            textAlign: isMyMessage ? 'right' : 'left'
                          }}
                        >
                          {message.content}
                        </div>

                        {/* Fecha/hora */}
                        <div
                          style={{
                            fontSize: '0.625rem',
                            textAlign: 'right',
                            marginTop: '4px',
                            opacity: '0.7'
                          }}
                        >
                          {formatMessageDate(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* Área de entrada de mensaje - fijada al fondo con flex-shrink-0 */}
        <div
          ref={chatContainerRef}
          className='sticky bottom-0 flex-shrink-0 bg-background p-3'
        >
          <form onSubmit={handleSendMessage} className='flex flex-col gap-2'>
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
              <Button
                type='button'
                variant='outline'
                size='icon'
                onClick={() => setMentionOpen(true)}
                disabled={!hasParticipants}
                className={cn(
                  'flex-shrink-0',
                  selectedParticipant &&
                    'border-primary text-primary hover:bg-primary/10'
                )}
              >
                {selectedParticipant ? (
                  <UserCheck className='h-4 w-4' />
                ) : (
                  <User className='h-4 w-4' />
                )}
              </Button>
              <Input
                ref={inputRef}
                placeholder={
                  !hasParticipants
                    ? 'No hay participantes disponibles para chatear'
                    : selectedParticipant
                      ? `Escribe un mensaje para ${selectedParticipant.name}...`
                      : 'Selecciona un destinatario...'
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
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
                No hay participantes disponibles. Para chatear, debe haber un
                gestor o asesor asignado a esta solicitud.
              </p>
            )}
          </form>
        </div>
      </div>

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
    </div>
  );
}
