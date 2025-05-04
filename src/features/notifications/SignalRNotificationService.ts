import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
  HubConnection,
  HubConnectionState
} from '@microsoft/signalr';
import { LoanNotification } from 'types/Notifications';

// Helper functions for logging
const logDev = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, ...args);
  }
};

const logDevError = (message: string, error: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, error);
  }
};

const logDevWarn = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(message, ...args);
  }
};

export interface ChatMessage {
  id: string;
  content: string;
  loanRequestId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  createdAt: string;
}

// Interface for chat message notifications
export interface ChatNotification {
  id: string;
  senderId: string;
  type: string;
}

class SignalRNotificationService {
  private connection: HubConnection | null;
  private notificationCallbacks: Map<
    string,
    (notification: LoanNotification) => void
  >;
  private chatCallbacks: Map<
    string,
    (notification: ChatNotification | ChatMessage) => void
  >;
  private connectionPromise: Promise<void> | null = null;
  private connecting: boolean = false;
  private retryCount: number = 0;
  private maxRetryCount: number = 3;
  private retryInterval: number = 5000; // 5 segundos
  private apiBaseUrl: string = '';
  private hubUrl: string = '';
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.connection = null;
    this.notificationCallbacks = new Map();
    this.chatCallbacks = new Map();
  }

  // Inicializar el servicio con la URL base y el token de acceso
  init(apiBaseUrl: string, accessToken?: string) {
    if (!apiBaseUrl) {
      return;
    }

    this.apiBaseUrl = apiBaseUrl;
    this.hubUrl = `${apiBaseUrl}/notification-hub`;

    // Crear la conexión con SignalR
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
      (window as any).__signalrConnection = this.connection;
    }

    // Configurar los manejadores de eventos
    if (this.connection) {
      // Para notificaciones generales
      this.connection.on(
        'ReceiveNotification',
        (notification: LoanNotification) => {
          this.handleNotification(notification);
        }
      );

      // Para mensajes de chat
      this.connection.on(
        'NewChatMessage',
        (senderId: string, messageId: string) => {
          try {
            logDev(
              `Received chat message notification. SenderId: ${senderId}, MessageId: ${messageId}`
            );
            this.handleNewChatMessageEvent(senderId, messageId);
          } catch (error) {
            logDevError('Error processing chat message notification:', error);
          }
        }
      );

      // Para mensajes de prueba
      this.connection.on('ReceiveMessage', (message: string) => {
        logDev('Test message received:', message);
      });

      // Manejadores de eventos de cambio de estado
      this.connection.onreconnecting((error) => {
        logDevWarn('SignalR reconectando...', error);
        this.connecting = true;
      });

      this.connection.onreconnected((connectionId) => {
        logDev('SignalR reconectado con ID:', connectionId);
        this.retryCount = 0;
        this.connecting = false;
      });

      this.connection.onclose((error) => {
        logDevWarn('SignalR desconectado', error);
        this.connecting = false;
        this.connection = null;
        this.connectionPromise = null;

        // Intentar reconectar si no hemos alcanzado el máximo de intentos
        if (this.retryCount < this.maxRetryCount) {
          this.retryCount++;
          this.reconnectTimeout = setTimeout(() => {
            if (accessToken) {
              this.start(accessToken).catch((err) =>
                logDevError('Error reconnecting:', err)
              );
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
      logDev(
        `SignalR connected successfully with ID: ${this.connection.connectionId}`
      );

      // Send a test message to verify connection
      this.sendTestMessage('SignalR service connected').catch((err) =>
        logDevWarn('Failed to send test message', err)
      );

      return promise;
    } catch (error) {
      this.connecting = false;
      this.connectionPromise = null;
      logDevError('Error starting SignalR connection:', error);
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
        logDevError('Error stopping SignalR connection:', error);
      } finally {
        this.connection = null;
        this.connectionPromise = null;
        this.connecting = false;
        this.retryCount = 0;
      }
    }
  }

  // Registrar callback para notificaciones generales
  onNotification(
    callback: (notification: LoanNotification) => void
  ): () => void {
    const id = Date.now().toString();
    this.notificationCallbacks.set(id, callback);
    return () => this.notificationCallbacks.delete(id);
  }

  // Registrar callback para mensajes de chat
  onChatMessage(
    callback: (notification: ChatNotification | ChatMessage) => void
  ): () => void {
    const id = Date.now().toString();
    this.chatCallbacks.set(id, callback);
    return () => this.chatCallbacks.delete(id);
  }

  // Manejar notificación recibida
  private handleNotification(notification: LoanNotification): void {
    this.notificationCallbacks.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        logDevError('Error in notification callback:', error);
      }
    });
  }

  // Notificar a todos los callbacks registrados sobre un nuevo mensaje de chat
  private handleNewChatMessageEvent(senderId: string, messageId: string): void {
    if (this.chatCallbacks.size === 0) {
      logDevWarn('No callbacks registered to handle chat messages');
      return;
    }

    logDev(
      `Notifying ${this.chatCallbacks.size} callbacks about new message ${messageId} from ${senderId}`
    );

    // Creamos un objeto de notificación temporal
    const notification: ChatNotification = {
      id: messageId,
      senderId,
      type: 'NEW_CHAT_MESSAGE'
    };

    // Pasamos la notificación a todos los callbacks registrados
    this.chatCallbacks.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        logDevError('Error in chat message callback:', error);
      }
    });
  }

  // Enviar un mensaje de prueba para confirmar que la conexión funciona
  async sendTestMessage(message: string): Promise<void> {
    if (
      !this.connection ||
      this.connection.state !== HubConnectionState.Connected
    ) {
      return Promise.reject('Not connected to SignalR hub');
    }

    try {
      await this.connection.invoke('SendTestMessage', message);
      logDev('Test message sent:', message);
    } catch (error) {
      logDevError('Error sending test message:', error);
      throw error;
    }
  }

  // Notificar sobre un nuevo mensaje de chat a un usuario específico
  async notifyNewChatMessage(
    receiverId: string,
    messageId: string
  ): Promise<void> {
    if (
      !this.connection ||
      this.connection.state !== HubConnectionState.Connected
    ) {
      return Promise.reject('Not connected to SignalR hub');
    }

    try {
      await this.connection.invoke(
        'NotifyNewChatMessage',
        receiverId,
        messageId
      );
      logDev(`Notified user ${receiverId} about message ${messageId}`);
    } catch (error) {
      logDevError('Error notifying about new chat message:', error);
      throw error;
    }
  }

  // Verificar si hay conexión activa
  isConnected(): boolean {
    return (
      !!this.connection &&
      this.connection.state === HubConnectionState.Connected
    );
  }

  // Obtener estado actual de la conexión
  getConnectionState(): string {
    if (!this.connection) return 'Disconnected';
    return this.connection.state;
  }

  // Obtener ID de la conexión
  getConnectionId(): string | null {
    if (!this.connection) return null;
    return this.connection.connectionId;
  }

  // Obtener URL base de la API
  getApiUrl(): string {
    return this.apiBaseUrl || process.env.NEXT_PUBLIC_API_URL || '';
  }
}

const notificationService = new SignalRNotificationService();
export default notificationService;
