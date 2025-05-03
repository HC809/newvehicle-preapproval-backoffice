import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
  HubConnection,
  HubConnectionState
} from '@microsoft/signalr';

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export enum ChatRoomType {
  Agent_Creator = 'Agent_Creator',
  Agent_Manager = 'Agent_Manager',
  Agent_PYMEAdvisor = 'Agent_PYMEAdvisor',
  Agent_BranchManager = 'Agent_BranchManager',
  Creator_PYMEAdvisor = 'Creator_PYMEAdvisor',
  All_Participants = 'All_Participants'
}

class SignalRChatService {
  private connection: HubConnection | null;
  private callbacks: Map<string, (message: ChatMessage) => void>;
  private connectionPromise: Promise<void> | null = null;
  private connecting: boolean = false;
  private currentRoomId: string | null = null;
  private retryCount: number = 0;
  private maxRetryCount: number = 3;
  private retryInterval: number = 5000; // 5 segundos
  private apiBaseUrl: string = '';
  private hubUrl: string = '';
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private serverErrorDetected: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    this.connection = null;
    this.callbacks = new Map();
  }

  // Inicializar el servicio con la URL base y el token de acceso
  init(apiBaseUrl: string, accessToken?: string) {
    if (!apiBaseUrl || this.isInitialized) {
      return;
    }

    this.apiBaseUrl = apiBaseUrl;
    this.hubUrl = `${apiBaseUrl}/notification-hub`; // Usar el mismo notification-hub como solución temporal

    // Resetear la bandera de error del servidor al inicializar
    this.serverErrorDetected = false;
    this.isInitialized = true;

    // Crear la conexión con SignalR - usar exactamente la misma configuración que en notificaciones
    this.connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => accessToken || '',
        transport:
          HttpTransportType.WebSockets |
          HttpTransportType.ServerSentEvents |
          HttpTransportType.LongPolling,
        skipNegotiation: false
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Aumentar el tiempo entre reintentos
          const delays = [0, 2000, 5000, 10000, 20000, 30000];
          return delays[retryContext.previousRetryCount] || 30000;
        }
      })
      .withServerTimeout(60000) // 60 segundos
      .withKeepAliveInterval(15000) // 15 segundos
      .configureLogging(LogLevel.Warning)
      .build();

    // Exponer la conexión para depuración en desarrollo
    if (typeof window !== 'undefined') {
      (window as any).__signalrChatConnection = this.connection;
    }

    // Configurar el manejador de eventos de recepción de mensajes
    if (this.connection) {
      this.connection.on('ReceiveNotification', (data: any) => {
        // Simulamos un mensaje de chat a partir de una notificación
        try {
          const simulatedMessage: ChatMessage = {
            id: data.id || `sim-${Date.now()}`,
            chatRoomId: this.currentRoomId || 'general',
            senderId: data.userToNotifyId || 'system',
            senderName: 'Sistema',
            content: data.message || 'Mensaje del sistema',
            sentAt: data.createdAt || new Date().toISOString(),
            isRead: false
          };
          this.handleMessage(simulatedMessage);
        } catch (error) {
          console.error('Error al procesar notificación como mensaje:', error);
        }
      });

      // Manejadores de eventos de cambio de estado
      this.connection.onreconnecting((error) => {
        console.warn('Chat SignalR reconectando...', error);
        this.connecting = true;
      });

      this.connection.onreconnected((connectionId) => {
        console.log('Chat SignalR reconectado con ID:', connectionId);
        this.retryCount = 0;
        this.connecting = false;
        this.serverErrorDetected = false;

        // Si estábamos en una sala, volver a unirse automáticamente
        if (this.currentRoomId) {
          this.joinRoom(this.currentRoomId).catch(() => {
            console.log(
              'No se pudo volver a unir a la sala después de reconectar'
            );
          });
        }
      });

      this.connection.onclose((error) => {
        console.warn('Chat SignalR desconectado', error);
        this.connecting = false;
        this.connection = null;
        this.connectionPromise = null;

        // Intentar reconectar si no hemos alcanzado el máximo de intentos
        if (this.retryCount < this.maxRetryCount) {
          this.retryCount++;
          this.reconnectTimeout = setTimeout(() => {
            if (accessToken) {
              this.start(accessToken).catch(() => {
                console.log('No se pudo reconectar al chat');
              });
            }
          }, this.retryInterval * this.retryCount);
        }
      });
    }
  }

  // Iniciar la conexión con el hub
  async start(token: string): Promise<void> {
    // Si ya hay una conexión activa o está en proceso de conexión, no continuar
    if (this.connecting && this.connectionPromise)
      return this.connectionPromise;
    if (
      this.connection &&
      this.connection.state === HubConnectionState.Connected
    ) {
      return Promise.resolve();
    }

    if (!token) {
      return Promise.reject('No token provided');
    }

    this.connecting = true;

    try {
      if (!this.connection) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('API URL not defined');
        }
        this.init(apiUrl, token);
      }

      if (!this.connection) {
        throw new Error('Failed to initialize connection');
      }

      const promise = this.connection.start();
      this.connectionPromise = promise;
      await promise;
      return promise;
    } catch (error) {
      this.connecting = false;
      this.connectionPromise = null;
      throw error;
    } finally {
      this.connecting = false;
    }
  }

  // Detener la conexión con el hub
  async stop(): Promise<void> {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
        console.error('Error stopping Chat SignalR connection:', error);
      } finally {
        this.connection = null;
        this.connectionPromise = null;
        this.connecting = false;
        this.retryCount = 0;
        this.serverErrorDetected = false;
        this.isInitialized = false;
      }
    }
  }

  // Ya no simulamos el unirse a salas, esto se maneja a través de la API
  async joinRoom(roomId: string): Promise<void> {
    return Promise.resolve();
  }

  // Ya no simulamos el salir de salas, esto se maneja a través de la API
  async leaveRoom(roomId: string): Promise<void> {
    return Promise.resolve();
  }

  // El envío de mensajes ahora se maneja a través de la API
  async sendMessage(roomId: string, message: string): Promise<void> {
    return Promise.resolve();
  }

  // Obtener userId del token JWT
  private getUserIdFromToken(): string | null {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;

      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return null;

      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.sub || payload.UserId || payload.nameid || null;
    } catch (e) {
      return null;
    }
  }

  // Obtener nombre de usuario del token JWT
  private getUserNameFromToken(): string | null {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;

      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return null;

      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.unique_name || payload.name || 'Usuario';
    } catch (e) {
      return null;
    }
  }

  // Suscribirse a mensajes de chat nuevos
  onMessage(callback: (message: ChatMessage) => void): () => void {
    const callbackId = Date.now().toString();
    this.callbacks.set(callbackId, callback);

    // Retornar función para anular la suscripción
    return () => {
      this.callbacks.delete(callbackId);
    };
  }

  // Manejar un mensaje recibido
  private handleMessage(message: ChatMessage): void {
    // Notificar a todos los oyentes
    this.callbacks.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error en callback de mensaje:', error);
      }
    });
  }

  // Verificar si hay una conexión activa
  isConnected(): boolean {
    return (
      !!this.connection &&
      this.connection.state === HubConnectionState.Connected
    );
  }

  // Obtener el estado actual de la conexión
  getConnectionState(): string {
    return this.connection?.state.toString() || 'Disconnected';
  }

  // Obtener el ID de la conexión actual
  getConnectionId(): string | null {
    return this.connection?.connectionId || null;
  }

  // Obtener el ID de la sala actual
  getCurrentRoomId(): string | null {
    return this.currentRoomId;
  }

  // Obtener la URL base de la API
  getApiUrl(): string {
    return this.apiBaseUrl || '';
  }

  // Verificar si se ha detectado un error del servidor
  hasServerError(): boolean {
    return this.serverErrorDetected;
  }

  // Restablecer el estado de error del servidor
  resetServerError(): void {
    this.serverErrorDetected = false;
  }
}

const chatService = new SignalRChatService();

export default chatService;
