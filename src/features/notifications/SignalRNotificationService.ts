import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
  HubConnection,
  HubConnectionState
} from '@microsoft/signalr';
import { LoanNotification } from 'types/Notifications';

class SignalRNotificationService {
  private connection: HubConnection | null;
  private callbacks: Map<string, (notification: LoanNotification) => void>;
  private connectionPromise: Promise<void> | null = null;
  private connecting: boolean = false;
  private retryCount: number = 0;
  private maxRetryCount: number = 3;
  private retryInterval: number = 5000; // 5 segundos
  private apiBaseUrl: string = '';
  private hubUrl: string = '';

  constructor() {
    this.connection = null;
    this.callbacks = new Map();
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
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(LogLevel.Information)
      .build();

    // Exponer la conexión para depuración en desarrollo
    if (typeof window !== 'undefined') {
      (window as any).__signalrConnection = this.connection;
    }

    // Configurar el manejador de eventos de recepción de mensajes
    if (this.connection) {
      this.connection.on(
        'ReceiveNotification',
        (notification: LoanNotification) => {
          this.handleNotification(notification);
        }
      );

      // Manejadores de eventos de cambio de estado
      this.connection.onreconnecting((error) => {});

      this.connection.onreconnected((connectionId) => {
        this.retryCount = 0;
      });

      this.connection.onclose((error) => {
        this.connecting = false;
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
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (error) {
      } finally {
        this.connection = null;
        this.connectionPromise = null;
        this.connecting = false;
      }
    }
  }

  // Registrar callback para notificaciones
  onNotification(
    callback: (notification: LoanNotification) => void
  ): () => void {
    const id = Date.now().toString();
    this.callbacks.set(id, callback);
    return () => this.callbacks.delete(id);
  }

  // Manejar notificación recibida
  private handleNotification(notification: LoanNotification): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {}
    });
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
