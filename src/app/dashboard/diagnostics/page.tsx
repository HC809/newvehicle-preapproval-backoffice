'use client';

import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignalRConnectionStatus } from '@/features/notifications/components/connection-status';
import { ApiConnectivityTest } from '@/features/notifications/components/api-status';
import { WebSocketInspector } from '@/features/notifications/components/websocket-inspector';
import { TokenValidator } from '@/features/notifications/components/token-validator';
import { NegotiateTester } from '@/features/notifications/components/negotiate-tester';
import { HttpTester } from '@/features/notifications/components/http-tester';

export default function DiagnosticsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex flex-col space-y-2'>
          <Heading
            title='Herramientas de Diagnóstico'
            description='Herramientas para diagnosticar problemas de conectividad y comunicación'
          />
          <p className='text-sm text-muted-foreground'>
            Estas herramientas ayudan a identificar problemas con las conexiones
            API, WebSockets, SignalR y autenticación de la aplicación.
          </p>
        </div>

        <Separator />

        <Tabs
          defaultValue='overview'
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className='mb-4'>
            <TabsTrigger value='overview'>Vista General</TabsTrigger>
            <TabsTrigger value='connection'>Conexión</TabsTrigger>
            <TabsTrigger value='auth'>Autenticación</TabsTrigger>
            <TabsTrigger value='api'>API</TabsTrigger>
          </TabsList>

          <TabsContent value='overview'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle>Estado de la Conexión SignalR</CardTitle>
                  <CardDescription>
                    Muestra el estado actual de la conexión SignalR y permite
                    reconectar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SignalRConnectionStatus minimal={true} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle>Prueba de API</CardTitle>
                  <CardDescription>
                    Verifica si la API está accesible y responde correctamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ApiConnectivityTest minimal={true} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle>Validación de Token</CardTitle>
                  <CardDescription>
                    Verifica si el token JWT es válido y su contenido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TokenValidator minimal={true} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='connection'>
            <div className='grid grid-cols-1 gap-4'>
              <SignalRConnectionStatus />
              <WebSocketInspector />
              <NegotiateTester />
            </div>
          </TabsContent>

          <TabsContent value='auth'>
            <div className='grid grid-cols-1 gap-4'>
              <TokenValidator />
            </div>
          </TabsContent>

          <TabsContent value='api'>
            <div className='grid grid-cols-1 gap-4'>
              <ApiConnectivityTest />
              <HttpTester />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
