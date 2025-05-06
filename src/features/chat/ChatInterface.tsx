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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [newMessage, setNewMessage] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionText, setMentionText] = useState('');
  const [selectedParticipant, setSelectedParticipant] =
    useState<ChatParticipant | null>(null);

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
      console.log('====== DEBUGGING CHAT INTERFACE ======');
      console.log('Current user ID from session:', userId);
      console.log('Current user NAME from session:', userName);
      console.log('Message IDs and their senders:');
      messages.forEach((msg) => {
        console.log(
          `Message: ${msg.id} | SenderUserId: ${msg.senderUserId} | SenderUserName: ${msg.senderUserName} | Match by name: ${msg.senderUserName === userName}`
        );
      });
      console.log('======================================');
    }
  }, [messages, userId, userName]);

  // Obtener función para enviar mensajes del contexto
  const { sendMessage, isConnected } = useChat();

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
  }, []);

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

  // Generar color de fondo basado en el ID del usuario
  const getParticipantColor = (userId: string) => {
    // Crear un hash simple del userId para obtener un número
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Colores predefinidos para usar (colores pastel/suaves)
    const colors = [
      'bg-blue-100 text-blue-900',
      'bg-green-100 text-green-900',
      'bg-yellow-100 text-yellow-900',
      'bg-purple-100 text-purple-900',
      'bg-pink-100 text-pink-900',
      'bg-indigo-100 text-indigo-900',
      'bg-teal-100 text-teal-900'
    ];

    // Usar el hash para seleccionar un color
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  return (
    <div className={cn('flex h-full w-full flex-col', className)}>
      {/* Encabezado del chat */}
      {/* <div className='border-b p-3'>
        <h3 className='font-medium'>{title || 'Chat grupal'}</h3>
      </div> */}

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
          ) : messages.length === 0 ? (
            <div className='flex h-full items-center justify-center'>
              <p className='text-muted-foreground'>No hay mensajes aún</p>
            </div>
          ) : (
            // Contenedor principal de mensajes con margen auto arriba para empujar todo hacia abajo
            <div className='mt-auto flex w-full flex-col space-y-4'>
              {messages.map((message) => {
                // Determinar si el mensaje es del usuario actual comparando por NOMBRE
                const isMyMessage = userName === message.senderUserName;
                console.log('userName', userName);
                console.log('message.senderUserName', message.senderUserName);
                console.log('isMyMessage', isMyMessage);

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
                          {message.receiverUserId && !isMyMessage && (
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
