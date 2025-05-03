'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { MessageCircle, Users, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatInterface } from './ChatInterface';
import { useToken } from '@/features/auth/TokenContext';
import { ChatRoomType } from './SignalRChatService';
import { useCreateChatRoom } from './api/chat-service';
import { useChatStore } from '@/stores/chat-store';

interface ChatButtonProps {
  type: ChatRoomType;
  loanRequestId: string;
  buttonText?: string;
  fullWidth?: boolean;
  variant?:
    | 'default'
    | 'destructive'
    | 'ghost'
    | 'link'
    | 'outline'
    | 'secondary';
  disabled?: boolean;
  existingChatRooms?: Array<{
    id: string;
    type: string;
  }>;
}

// Constantes para roles - usar los valores exactos del enum UserRole
const ROLE_ADMIN = 'BusinessDevelopment_Admin';
const ROLE_USER = 'BusinessDevelopment_User';

export function ChatButton({
  type,
  loanRequestId,
  buttonText,
  fullWidth = false,
  variant = 'default',
  disabled = false,
  existingChatRooms = []
}: ChatButtonProps) {
  const { accessToken, userRole } = useToken();
  const { unreadCountByRoom } = useChatStore();
  const [open, setOpen] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasTriedCreatingRoom = useRef(false);

  // Mutation para crear una sala de chat
  const createChatRoom = useCreateChatRoom();

  // Buscar sala existente por tipo
  const existingChatRoom = useMemo(() => {
    return existingChatRooms.find((room) => room.type === type);
  }, [existingChatRooms, type]);

  // No necesitamos verificar múltiples roles, solo 2 específicos para chats
  const canViewChat = useCallback(() => {
    // Si el usuario no tiene rol, no mostrar nada
    if (!userRole) {
      return false;
    }

    // Si es BusinessDevelopment_Admin, solo puede ver chats Agent_Manager
    if (userRole === ROLE_ADMIN) {
      return type === ChatRoomType.Agent_Manager;
    }

    // Si es BusinessDevelopment_User, puede ver Agent_Creator y Agent_Manager
    if (userRole === ROLE_USER) {
      return (
        type === ChatRoomType.Agent_Creator ||
        type === ChatRoomType.Agent_Manager
      );
    }

    return false;
  }, [userRole, type]);

  // Función para obtener o crear la sala de chat según sea necesario
  const createChatRoomIfNeeded = useCallback(() => {
    if (!accessToken || isCreatingRoom || hasTriedCreatingRoom.current) {
      return;
    }

    // Si ya existe una sala de chat, usarla
    if (existingChatRoom) {
      console.log('Usando sala de chat existente:', existingChatRoom.id);
      setRoomId(existingChatRoom.id);
      return;
    }

    // Validar el ID de solicitud
    if (!loanRequestId) {
      setError('ID de solicitud no proporcionado');
      return;
    }

    // Crear una nueva sala solo si no existe
    setIsCreatingRoom(true);
    setError(null);
    hasTriedCreatingRoom.current = true;

    createChatRoom.mutate(
      { loanRequestId, type },
      {
        onSuccess: (chatRoom) => {
          if (chatRoom && chatRoom.id) {
            console.log('Nueva sala de chat creada:', chatRoom.id);
            setRoomId(chatRoom.id);
          }
          setIsCreatingRoom(false);
        },
        onError: (error: any) => {
          console.error('Error al crear sala de chat:', error);
          setError(error?.message || 'Error al crear la sala de chat');
          setIsCreatingRoom(false);
        }
      }
    );
  }, [
    accessToken,
    isCreatingRoom,
    loanRequestId,
    type,
    createChatRoom,
    existingChatRoom
  ]);

  // Obtener o crear la sala cuando se abre el popover por primera vez
  useEffect(() => {
    if (open) {
      createChatRoomIfNeeded();
    } else {
      // Cuando se cierra el popover, reseteamos la bandera para permitir un nuevo intento
      hasTriedCreatingRoom.current = false;
    }
  }, [open, createChatRoomIfNeeded]);

  // Obtener el conteo de mensajes no leídos para esta sala específica
  const unreadCount = roomId ? unreadCountByRoom[roomId] || 0 : 0;

  // Función para obtener el título del chat según el tipo y el rol del usuario
  const getChatTitle = useCallback(() => {
    // Si es admin, el chat Agent_Manager se muestra como "Chat con Gestor"
    if (userRole === ROLE_ADMIN && type === ChatRoomType.Agent_Manager) {
      return 'Chat con Gestor';
    }

    switch (type) {
      case ChatRoomType.Agent_Creator:
        return 'Chat con Concesionario';
      case ChatRoomType.Agent_Manager:
        return 'Chat con Administrador';
      default:
        return buttonText || 'Chat';
    }
  }, [type, userRole, buttonText]);

  // Obtener el ícono según el tipo de chat
  const getChatIcon = useCallback(() => {
    switch (type) {
      case ChatRoomType.Agent_Creator:
        return <Building2 className='h-4 w-4' />;
      case ChatRoomType.Agent_Manager:
        return <Users className='h-4 w-4' />;
      default:
        return <MessageCircle className='h-4 w-4' />;
    }
  }, [type]);

  // Manejar apertura/cierre del popover
  const handleOpenChange = (isOpen: boolean) => {
    // No permitir abrir si está deshabilitado
    if (disabled && isOpen) {
      return;
    }

    setOpen(isOpen);
  };

  // Si el usuario no tiene permiso para ver este chat, no renderizar el componente
  if (!canViewChat()) {
    return null;
  }

  // Renderizar el botón de chat
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          className={`relative ${fullWidth ? 'w-full' : ''} gap-2`}
          disabled={disabled || isCreatingRoom}
          title={
            disabled ? 'No disponible en el estado actual' : getChatTitle()
          }
        >
          {getChatIcon()}
          {buttonText || getChatTitle()}
          {unreadCount > 0 && (
            <Badge
              className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs'
              variant='destructive'
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      {open && (
        <PopoverContent
          className='h-[500px] w-80 p-0 sm:w-96 md:w-[450px]'
          align='end'
        >
          {isCreatingRoom ? (
            <div className='flex h-full items-center justify-center p-8'>
              <p>Cargando sala de chat...</p>
            </div>
          ) : roomId ? (
            <ChatInterface
              roomId={roomId}
              title={getChatTitle()}
              className='h-full'
            />
          ) : error || createChatRoom.isError ? (
            <div className='flex h-full flex-col items-center justify-center p-8'>
              <p className='mb-4 text-center text-red-500'>
                {error || 'No se pudo cargar la sala de chat.'}
              </p>
              <Button
                onClick={() => {
                  setError(null);
                  hasTriedCreatingRoom.current = false;
                  createChatRoomIfNeeded();
                }}
                disabled={isCreatingRoom}
              >
                Reintentar
              </Button>
            </div>
          ) : (
            <div className='flex h-full items-center justify-center p-8'>
              <p>Cargando chat...</p>
              <Button
                onClick={() => {
                  hasTriedCreatingRoom.current = false;
                  createChatRoomIfNeeded();
                }}
                disabled={isCreatingRoom}
                className='ml-2'
              >
                Cargar
              </Button>
            </div>
          )}
        </PopoverContent>
      )}
    </Popover>
  );
}
