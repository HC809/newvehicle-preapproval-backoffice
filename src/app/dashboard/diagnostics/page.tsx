'use client';

import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SignalRConnectionStatus } from '@/features/diagnostics/components/connection-status';
import { ApiConnectivityTest } from '@/features/diagnostics/components/api-status';
import { WebSocketInspector } from '@/features/diagnostics/components/websocket-inspector';
import { TokenValidator } from '@/features/diagnostics/components/token-validator';
import { NegotiateTester } from '@/features/diagnostics/components/negotiate-tester';
import { HttpTester } from '@/features/diagnostics/components/http-tester';

export default function DiagnosticsPage() {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [autoRefresh] = useState<boolean>(false);

  useEffect(() => {
    // Si autoRefresh está activado, actualiza cada 20 segundos
    let intervalId: NodeJS.Timeout;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        // Solo recargamos la página completamente
        // , ya que
        // cada herramienta tiene su propia lógica para verificar su estado
        window.location.reload();
      }, 20000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh]);

  const renderSelectedComponent = () => {
    switch (activeComponent) {
      case 'signalr':
        return <SignalRConnectionStatus />;
      case 'websocket':
        return <WebSocketInspector />;
      case 'negotiate':
        return <NegotiateTester />;
      case 'token':
        return <TokenValidator />;
      case 'api':
        return <ApiConnectivityTest />;
      case 'http':
        return <HttpTester />;
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex flex-col space-y-2'>
          <Heading
            title='Herramientas de Diagnóstico'
            description='Herramientas para diagnosticar problemas de conectividad y comunicación'
          />
          <div className='flex items-center justify-between'>
            <p className='text-sm text-muted-foreground'>
              Estas herramientas ayudan a identificar problemas con las
              conexiones API, WebSockets, SignalR y autenticación de la
              aplicación.
            </p>
            {/* <Button 
                            variant={autoRefresh ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className="ml-2"
                        >
                            {autoRefresh ? "Detener actualización" : "Actualización auto."}
                        </Button> */}
          </div>
        </div>

        <Separator />

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card
            className={
              activeComponent === 'signalr'
                ? 'border-primary ring-1 ring-primary'
                : ''
            }
          >
            <CardHeader className='pb-2'>
              <CardTitle>Estado de la Conexión SignalR</CardTitle>
              <CardDescription>
                Muestra el estado actual de la conexión SignalR y permite
                reconectar
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              <SignalRConnectionStatus minimal={true} />
              <Button
                variant='outline'
                onClick={() => setActiveComponent('signalr')}
              >
                Ver detalles
              </Button>
            </CardContent>
          </Card>

          <Card
            className={
              activeComponent === 'websocket'
                ? 'border-primary ring-1 ring-primary'
                : ''
            }
          >
            <CardHeader className='pb-2'>
              <CardTitle>Inspector WebSocket</CardTitle>
              <CardDescription>
                Analiza las conexiones WebSocket y su estado
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              <WebSocketInspector minimal={true} />
              <Button
                variant='outline'
                onClick={() => setActiveComponent('websocket')}
              >
                Ver detalles
              </Button>
            </CardContent>
          </Card>

          <Card
            className={
              activeComponent === 'negotiate'
                ? 'border-primary ring-1 ring-primary'
                : ''
            }
          >
            <CardHeader className='pb-2'>
              <CardTitle>Prueba de Negociación</CardTitle>
              <CardDescription>
                Verifica el proceso de negociación de SignalR
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              <NegotiateTester minimal={true} />
              <Button
                variant='outline'
                onClick={() => setActiveComponent('negotiate')}
              >
                Ver detalles
              </Button>
            </CardContent>
          </Card>

          <Card
            className={
              activeComponent === 'token'
                ? 'border-primary ring-1 ring-primary'
                : ''
            }
          >
            <CardHeader className='pb-2'>
              <CardTitle>Validación de Token</CardTitle>
              <CardDescription>
                Verifica si el token JWT es válido y su contenido
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              <TokenValidator minimal={true} />
              <Button
                variant='outline'
                onClick={() => setActiveComponent('token')}
              >
                Ver detalles
              </Button>
            </CardContent>
          </Card>

          <Card
            className={
              activeComponent === 'api'
                ? 'border-primary ring-1 ring-primary'
                : ''
            }
          >
            <CardHeader className='pb-2'>
              <CardTitle>Prueba de API</CardTitle>
              <CardDescription>
                Verifica si la API está accesible y responde correctamente
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              <ApiConnectivityTest minimal={true} />
              <Button
                variant='outline'
                onClick={() => setActiveComponent('api')}
              >
                Ver detalles
              </Button>
            </CardContent>
          </Card>

          <Card
            className={
              activeComponent === 'http'
                ? 'border-primary ring-1 ring-primary'
                : ''
            }
          >
            <CardHeader className='pb-2'>
              <CardTitle>Prueba HTTP</CardTitle>
              <CardDescription>
                Realiza pruebas HTTP personalizadas a endpoints específicos
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-3'>
              <HttpTester minimal={true} />
              <Button
                variant='outline'
                onClick={() => setActiveComponent('http')}
              >
                Ver detalles
              </Button>
            </CardContent>
          </Card>
        </div>

        {activeComponent && (
          <div className='mt-6'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-medium'>
                Detalles de la herramienta
              </h3>
              <Button variant='ghost' onClick={() => setActiveComponent(null)}>
                Cerrar
              </Button>
            </div>
            <Card>
              <CardContent className='pt-6'>
                {renderSelectedComponent()}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
