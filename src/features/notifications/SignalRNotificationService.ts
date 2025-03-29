import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
  HubConnection,
  HubConnectionState
} from '@microsoft/signalr';
import { Notification, NotificationResponse } from './types';
import { getSession } from 'next-auth/react';

class SignalRNotificationService {
  private connection: HubConnection | null;
  private callbacks: Map<string, (notification: Notification) => void>;
  private connectionPromise: Promise<void> | null = null;
  private connecting: boolean = false;
  private retryCount: number = 0;
  private maxRetryCount: number = 3;
  private retryInterval: number = 5000; // 5 segundos

  constructor() {
    this.connection = null;
    this.callbacks = new Map();
    console.log('SignalRNotificationService constructor');
  }

  async start(token: string) {
    // Si ya hay una conexión activa o está en proceso de conexión, no continuar
    if (this.connecting) return this.connectionPromise;
    if (
      this.connection &&
      this.connection.state === HubConnectionState.Connected
    )
      return Promise.resolve();

    if (!token) {
      console.error('No token provided for SignalR connection');
      return Promise.reject('No token provided');
    }

    this.connecting = true;
    console.log(
      'Iniciando conexión SignalR con token:',
      token.substring(0, 15) + '...'
    );

    // Crear la conexión SignalR
    try {
      // Depurar la URL del hub
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error(
          'NEXT_PUBLIC_API_URL is not defined in environment variables'
        );
        this.connecting = false;
        return Promise.reject('API URL not defined');
      }

      // Construir URL del hub
      const hubUrl = `${apiUrl}/notification-hub`;
      console.log(`Connecting to SignalR hub at: ${hubUrl}`);

      // Definir opciones para garantizar la máxima compatibilidad
      const token_string = String(token);
      const httpConnectionOptions = {
        accessTokenFactory: () => token_string,
        // Permitir todos los tipos de transporte, dejando que SignalR elija el mejor
        transport:
          HttpTransportType.WebSockets |
          HttpTransportType.ServerSentEvents |
          HttpTransportType.LongPolling,
        skipNegotiation: false, // No omitir negociación para compatibilidad
        // Incluir los headers de autorización para compatibilidad adicional
        headers: {
          Authorization: `Bearer ${token_string}`
        }
      };

      // Intentar primero con la configuración más flexible
      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, httpConnectionOptions)
        .configureLogging(LogLevel.Debug)
        .withAutomaticReconnect([0, 2000, 5000, 10000, 15000, 30000])
        .build();

      // Configurar eventos de conexión para debugging
      this.connection.onreconnecting((error) => {
        console.log('SignalR reconnecting due to error:', error);
      });

      this.connection.onreconnected((connectionId) => {
        console.log('SignalR reconnected with connection ID:', connectionId);
      });

      this.connection.onclose((error) => {
        console.log('SignalR connection closed. Error:', error);
        this.connecting = false;
      });

      // Configurar handler para recibir notificaciones
      this.connection.on(
        'ReceiveNotification',
        (notification: NotificationResponse) => {
          console.log('Notification received:', notification);

          // Convertir respuesta del servidor a nuestro tipo interno de Notification
          const formattedNotification: Notification = {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type as Notification['type'],
            userToNotifyId: notification.userToNotifyId,
            expiredAt: notification.expiredAt,
            isRead: notification.isRead,
            readAt: notification.readAt,
            createdAt: notification.createdAt,
            metadata: notification.metadata
          };
          this.handleNotification(formattedNotification);
        }
      );

      // Iniciar la conexión
      console.log('Attempting to start SignalR connection...');
      this.connectionPromise = this.connection.start();
      await this.connectionPromise;
      console.log(
        'Connected to SignalR hub successfully with ID:',
        this.connection.connectionId
      );
      console.log('Connection state:', this.connection.state);
      return this.connectionPromise;
    } catch (error) {
      console.error('Error connecting to SignalR hub:', error);

      // Información de depuración sobre el error
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }

      // Si falla con la configuración normal, intentar con una configuración alternativa
      // que use negotiate con token en la URL (algunas implementaciones requieren esto)
      try {
        console.log('Trying alternative SignalR connection configuration...');
        const hubUrl = `${process.env.NEXT_PUBLIC_API_URL}/notification-hub`;

        this.connection = new HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => String(token),
            transport: HttpTransportType.LongPolling, // Intentar con LongPolling como fallback
            skipNegotiation: false
          })
          .configureLogging(LogLevel.Debug)
          .withAutomaticReconnect()
          .build();

        // Reconfigurar los eventos
        this.connection.on(
          'ReceiveNotification',
          (notification: NotificationResponse) => {
            const formattedNotification: Notification = {
              id: notification.id,
              title: notification.title,
              message: notification.message,
              type: notification.type as Notification['type'],
              userToNotifyId: notification.userToNotifyId,
              expiredAt: notification.expiredAt,
              isRead: notification.isRead,
              readAt: notification.readAt,
              createdAt: notification.createdAt,
              metadata: notification.metadata
            };
            this.handleNotification(formattedNotification);
          }
        );

        console.log('Attempting fallback SignalR connection...');
        this.connectionPromise = this.connection.start();
        await this.connectionPromise;
        console.log(
          'Fallback connection successful with ID:',
          this.connection.connectionId
        );
        return this.connectionPromise;
      } catch (fallbackError) {
        console.error('Fallback connection also failed:', fallbackError);
        this.connecting = false;
        this.connection = null;
        this.connectionPromise = null;
        throw fallbackError;
      }
    } finally {
      this.connecting = false;
    }
  }

  onNotification(callback: (notification: Notification) => void) {
    const id = Date.now().toString();
    this.callbacks.set(id, callback);
    return () => this.callbacks.delete(id);
  }

  handleNotification(notification: Notification) {
    this.callbacks.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  async stop() {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log('SignalR connection stopped');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      } finally {
        this.connection = null;
        this.connectionPromise = null;
        this.connecting = false;
      }
    }
  }

  // Comprueba si la conexión está activa
  isConnected(): boolean {
    return (
      !!this.connection &&
      this.connection.state === HubConnectionState.Connected
    );
  }

  // Método para obtener el estado actual de la conexión
  public getConnectionState(): string {
    if (!this.connection) return 'Disconnected';
    return this.connection.state;
  }

  getConnectionId(): string | null {
    if (!this.connection) return null;
    return this.connection.connectionId;
  }

  // Método para obtener la URL base de la API
  getApiUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    return apiUrl;
  }

  public async startConnection(
    accessToken: string,
    onMessageReceived: (notification: any) => void
  ): Promise<void> {
    // Si ya existe una conexión activa, no hacemos nada
    if (
      this.connection &&
      this.connection.state === HubConnectionState.Connected
    ) {
      console.log(
        'Connection already established. Connection ID:',
        this.connection.connectionId
      );
      return;
    }

    // Si hay una conexión en progreso, esperamos a que termine
    if (this.connectionPromise) {
      console.log('Connection attempt already in progress. Waiting...');
      return this.connectionPromise;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      console.error('API URL is not defined in environment variables');
      throw new Error('API URL is not defined');
    }

    // Construimos la URL del hub de notificaciones
    const hubUrl = `${apiUrl}/notification-hub`;
    console.log('Connecting to SignalR hub at:', hubUrl);

    try {
      // Construimos la conexión con el hub
      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          // Permitir todos los tipos de transporte, dejando que SignalR elija el mejor
          transport:
            HttpTransportType.WebSockets |
            HttpTransportType.ServerSentEvents |
            HttpTransportType.LongPolling,
          accessTokenFactory: () => accessToken,
          skipNegotiation: false, // No omitir negociación para compatibilidad
          headers: {
            Authorization: `Bearer ${accessToken}` // Usar header en lugar de query param
          }
        })
        .configureLogging(LogLevel.Debug)
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .build();

      // Configuramos el manejador de mensajes
      this.connection.on('ReceiveNotification', (notification) => {
        console.log('Received notification:', notification);
        onMessageReceived(notification);
      });

      // Configuramos manejadores de eventos de conexión
      this.connection.onreconnecting((error) => {
        console.log('Connection lost. Attempting to reconnect...', error);
      });

      this.connection.onreconnected((connectionId) => {
        console.log('Connection reestablished. Connection ID:', connectionId);
        this.retryCount = 0; // Reiniciamos el contador de reintentos
      });

      this.connection.onclose((error) => {
        console.log('Connection closed', error);
        if (error) {
          console.error('Connection closed with error:', error);
          this.retryConnection(accessToken, onMessageReceived);
        }
      });

      // Iniciamos la conexión
      this.connectionPromise = this.connection.start();
      await this.connectionPromise;

      console.log(
        'Connected successfully to SignalR hub! Connection ID:',
        this.connection.connectionId
      );
      // La propiedad transport no está disponible directamente, mostramos solo el connectionId
      this.retryCount = 0; // Reiniciamos el contador de reintentos

      return this.connectionPromise;
    } catch (error) {
      console.error('Error connecting to SignalR hub:', error);
      this.retryConnection(accessToken, onMessageReceived);
      throw error;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async retryConnection(
    accessToken: string,
    onMessageReceived: (notification: any) => void
  ): Promise<void> {
    // Si ya hemos alcanzado el máximo de reintentos, no intentamos más
    if (this.retryCount >= this.maxRetryCount) {
      console.log(
        `Maximum retry count (${this.maxRetryCount}) reached. Stopping retry attempts.`
      );
      return;
    }

    this.retryCount++;
    console.log(
      `Retrying connection (attempt ${this.retryCount} of ${this.maxRetryCount}) in ${this.retryInterval / 1000} seconds...`
    );

    // Esperamos un tiempo antes de reintentar
    await new Promise((resolve) => setTimeout(resolve, this.retryInterval));

    try {
      // Intentamos iniciar la conexión de nuevo
      await this.startConnection(accessToken, onMessageReceived);
    } catch (error) {
      console.error('Retry attempt failed:', error);
    }
  }

  public async stopConnection(): Promise<void> {
    if (
      this.connection &&
      this.connection.state === HubConnectionState.Connected
    ) {
      try {
        await this.connection.stop();
        console.log('Connection stopped successfully');
      } catch (error) {
        console.error('Error stopping connection:', error);
        throw error;
      }
    } else {
      console.log('No active connection to stop');
    }
  }

  public async reconnect(): Promise<void> {
    if (!this.connection) {
      console.log(
        'No connection instance exists. Creating a new connection...'
      );
      const session = await getSession();
      if (session?.accessToken) {
        await this.startConnection(String(session.accessToken) as string, () =>
          console.log('Reconnection message handler placeholder')
        );
      } else {
        throw new Error('No access token available for reconnection');
      }
      return;
    }

    try {
      if (this.connection.state === HubConnectionState.Disconnected) {
        console.log('Reconnecting to hub...');
        await this.connection.start();
        console.log(
          'Reconnected successfully! Connection ID:',
          this.connection.connectionId
        );
      } else {
        console.log('Connection is already in state:', this.connection.state);
      }
    } catch (error) {
      console.error('Error during reconnection:', error);
      throw error;
    }
  }
}

const notificationService = new SignalRNotificationService();
export default notificationService;
