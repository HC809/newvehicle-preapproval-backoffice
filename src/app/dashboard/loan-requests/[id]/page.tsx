'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Car,
  DollarSign,
  FileText,
  User,
  Building,
  UserCog,
  MapPin,
  CreditCard,
  Percent
} from 'lucide-react';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

import { LoanRequest } from 'types/LoanRequests';
import { useLoanRequestStore } from '@/stores/loan-request-store';
import ErrorAlert from '@/components/custom/error-alert';
import { formatUSD, formatHNL } from '@/utils/formatCurrency';
import { formatLoanRequestId } from '@/utils/formatId';

// Función para obtener el color del badge según el estado
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'aprobado':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'rechazado':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'en revisión':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
  }
};

// Componente para mostrar información en formato de etiqueta y valor
const InfoItem = ({
  label,
  value,
  icon,
  iconColor = 'text-muted-foreground',
  textColor = '',
  darkTextColor = ''
}: {
  label: string;
  value: string | number | null;
  icon?: React.ReactNode;
  iconColor?: string;
  textColor?: string;
  darkTextColor?: string;
}) => (
  <div className='flex items-start space-x-3 py-2'>
    {icon && <div className={`mt-0.5 ${iconColor}`}>{icon}</div>}
    <div>
      <p className='text-sm font-medium text-muted-foreground'>{label}</p>
      <p className={`text-base font-medium ${textColor} ${darkTextColor}`}>
        {value || 'No disponible'}
      </p>
    </div>
  </div>
);

export default function LoanRequestDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { selectedLoanRequest } = useLoanRequestStore();
  const [loanRequest, setLoanRequest] = useState<LoanRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Efecto para eliminar el resaltado en las tabs cuando se presiona una tecla
  useEffect(() => {
    const handleKeyDown = () => {
      if (document.activeElement) {
        (document.activeElement as HTMLElement).blur();
      }
    };

    // Agregar el event listener al documento
    document.addEventListener('keydown', handleKeyDown);

    // Agregar estilos CSS para eliminar el resaltado
    const style = document.createElement('style');
    style.innerHTML = `
          [data-state="active"] {
            outline: none !important;
            box-shadow: none !important;
            border-color: transparent !important;
          }
          
          *:focus, *:focus-visible {
            outline: none !important;
            box-shadow: none !important;
            border-color: transparent !important;
          }
        `;
    document.head.appendChild(style);

    // Limpiar el event listener y los estilos cuando el componente se desmonte
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Verificamos si tenemos la solicitud en el store y si coincide con el ID de la URL
    if (selectedLoanRequest && selectedLoanRequest.id === id) {
      setLoanRequest(selectedLoanRequest);
      setError(null);
    } else {
      // Si no tenemos la solicitud en el store o no coincide con el ID, mostramos un mensaje
      setError(
        'No se encontró la solicitud. Por favor, regrese a la lista y seleccione una solicitud.'
      );
    }
    setLoading(false);
  }, [id, selectedLoanRequest]);

  const handleBack = () => {
    router.back();
  };

  // Botón para volver a la lista de solicitudes
  const handleGoToList = () => {
    router.push('/dashboard/loan-requests');
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='outline' size='icon' onClick={handleBack}>
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <Heading
              title='Detalle de Solicitud de Préstamo'
              description='Información completa sobre la solicitud'
            />
          </div>
        </div>

        <Separator />

        {error ? (
          <div className='space-y-4'>
            <Alert variant='destructive'>
              <AlertTitle>No se encontraron datos</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className='flex justify-center'>
              <Button onClick={handleGoToList} variant='default'>
                Volver a la lista de solicitudes
              </Button>
            </div>
          </div>
        ) : loading ? (
          <LoanRequestDetailSkeleton />
        ) : loanRequest ? (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            {/* Columna izquierda - Información principal */}
            <div className='space-y-6 lg:col-span-2'>
              <Card className='border-t-4 border-t-blue-500 dark:border-t-blue-400'>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <div>
                    <CardTitle className='text-xl'>
                      Solicitud #{formatLoanRequestId(loanRequest.id)}
                    </CardTitle>
                    <CardDescription className='flex items-center gap-2'>
                      <User className='h-4 w-4 text-green-500 dark:text-green-400' />
                      <span className='text-green-700 dark:text-green-300'>
                        Creada por {loanRequest.creatorName}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(loanRequest.status)}>
                    {loanRequest.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue='general' className='w-full'>
                    <TabsList className='grid w-full grid-cols-3'>
                      <TabsTrigger value='general'>General</TabsTrigger>
                      <TabsTrigger value='vehicle'>Vehículo</TabsTrigger>
                      <TabsTrigger value='financial'>Financiero</TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value='general'
                      className='mt-4 space-y-4 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
                    >
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InfoItem
                          label='DNI Solicitante'
                          value={loanRequest.dni}
                          icon={<CreditCard size={18} />}
                          iconColor='text-amber-500'
                          textColor='text-amber-700'
                          darkTextColor='dark:text-amber-300'
                        />
                        <InfoItem
                          label='Ciudad'
                          value={loanRequest.city}
                          icon={<MapPin size={18} />}
                          iconColor='text-red-500'
                          textColor='text-red-700'
                          darkTextColor='dark:text-red-300'
                        />
                        <InfoItem
                          label='Concesionario'
                          value={loanRequest.dealershipName}
                          icon={<Building size={18} />}
                          iconColor='text-blue-500'
                          textColor='text-blue-700'
                          darkTextColor='dark:text-blue-300'
                        />
                        <InfoItem
                          label='Gerente Asignado'
                          value={loanRequest.managerName}
                          icon={<UserCog size={18} />}
                          iconColor='text-purple-500'
                          textColor='text-purple-700'
                          darkTextColor='dark:text-purple-300'
                        />
                        <InfoItem
                          label='Ingreso Mensual'
                          value={formatHNL(loanRequest.monthlyIncome)}
                          icon={<DollarSign size={18} />}
                          iconColor='text-emerald-500'
                          textColor='text-emerald-700'
                          darkTextColor='dark:text-emerald-300'
                        />
                      </div>
                    </TabsContent>

                    <TabsContent
                      value='vehicle'
                      className='mt-4 space-y-4 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
                    >
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InfoItem
                          label='Tipo de Vehículo'
                          value={loanRequest.vehicleTypeName}
                          icon={<Car size={18} />}
                        />
                        <InfoItem
                          label='Marca'
                          value={loanRequest.vehicleBrand}
                        />
                        <InfoItem
                          label='Modelo'
                          value={loanRequest.vehicleModel}
                        />
                        <InfoItem
                          label='Año'
                          value={loanRequest.vehicleYear}
                          icon={<Calendar size={18} />}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent
                      value='financial'
                      className='mt-4 space-y-4 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
                    >
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <InfoItem
                          label='Monto Solicitado'
                          value={formatUSD(loanRequest.requestedAmount)}
                          icon={<DollarSign size={18} />}
                        />
                        <InfoItem
                          label='Plazo Solicitado'
                          value={`${loanRequest.requestedLoanTermMonths} meses`}
                          icon={<Calendar size={18} />}
                        />
                        <InfoItem
                          label='Plazo Aprobado'
                          value={`${loanRequest.approvedLoanTermMonths} meses`}
                          icon={<Calendar size={18} />}
                        />
                        <InfoItem
                          label='Tasa de Interés'
                          value={`${loanRequest.appliedInterestRate}%`}
                          icon={<Percent size={18} />}
                        />
                        <InfoItem
                          label='Tipo de Cambio USD'
                          value={`$${loanRequest.dollarExchangeRate.toFixed(2)}`}
                          icon={<DollarSign size={18} />}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {loanRequest.comment && (
                <Card className='border-l-4 border-l-amber-500 dark:border-l-amber-400'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-2 text-lg'>
                      <FileText className='h-5 w-5 text-amber-500 dark:text-amber-400' />
                      <span>Comentarios</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className='h-[100px] w-full rounded-md border p-4'>
                      <p className='text-sm'>{loanRequest.comment}</p>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {loanRequest.rejectionReason && (
                <Alert
                  variant='destructive'
                  className='border-l-4 border-l-red-500'
                >
                  <FileText className='h-4 w-4' />
                  <AlertTitle>Motivo de Rechazo</AlertTitle>
                  <AlertDescription>
                    {loanRequest.rejectionReason}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Columna derecha - Información adicional y acciones */}
            <div className='space-y-6'>
              <Card className='border-t-4 border-t-emerald-500 dark:border-t-emerald-400'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <DollarSign className='h-5 w-5 text-emerald-500 dark:text-emerald-400' />
                    <span>Resumen Financiero</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Monto solicitado
                    </span>
                    <span className='font-medium text-emerald-700 dark:text-emerald-300'>
                      {formatUSD(loanRequest.requestedAmount)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>Plazo</span>
                    <span className='font-medium'>
                      {loanRequest.approvedLoanTermMonths} meses
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>
                      Tasa de interés
                    </span>
                    <span className='font-medium'>
                      {loanRequest.appliedInterestRate}%
                    </span>
                  </div>
                  <Separator />
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>Cuota estimada</span>
                    <span className='font-bold text-emerald-700 dark:text-emerald-300'>
                      {formatUSD(
                        (loanRequest.requestedAmount *
                          (1 + loanRequest.appliedInterestRate / 100)) /
                          loanRequest.approvedLoanTermMonths
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className='border-l-4 border-l-purple-500 dark:border-l-purple-400'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <UserCog className='h-5 w-5 text-purple-500 dark:text-purple-400' />
                    <span>Responsables</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center space-x-4'>
                    <Avatar className='border-2 border-green-200 bg-green-50 dark:bg-green-900/20'>
                      <AvatarFallback className='text-green-700 dark:text-green-300'>
                        {loanRequest.creatorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='text-sm font-medium text-green-700 dark:text-green-300'>
                        {loanRequest.creatorName}
                      </p>
                      <p className='text-xs text-muted-foreground'>Creador</p>
                    </div>
                  </div>
                  <Separator />
                  <div className='flex items-center space-x-4'>
                    <Avatar className='border-2 border-purple-200 bg-purple-50 dark:bg-purple-900/20'>
                      <AvatarFallback className='text-purple-700 dark:text-purple-300'>
                        {loanRequest.managerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='text-sm font-medium text-purple-700 dark:text-purple-300'>
                        {loanRequest.managerName}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Gerente Asignado
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className='flex flex-col space-y-2'>
                <Button variant='default'>Editar Solicitud</Button>
                <Button variant='outline' onClick={handleBack}>
                  Volver a la lista
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertTitle>Solicitud no encontrada</AlertTitle>
            <AlertDescription>
              No se pudo encontrar la solicitud de préstamo con el ID
              especificado.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </PageContainer>
  );
}

// Componente Skeleton para mostrar durante la carga
const LoanRequestDetailSkeleton = () => (
  <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
    <div className='space-y-6 lg:col-span-2'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <div className='space-y-1'>
            <Skeleton className='h-6 w-40' />
            <Skeleton className='h-4 w-24' />
          </div>
          <Skeleton className='h-6 w-24' />
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            <Skeleton className='h-10 w-full' />
            <div className='mt-4 grid grid-cols-2 gap-4'>
              {[...Array(6)].map((_, i) => (
                <div key={i} className='space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-6 w-full' />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-32' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[100px] w-full' />
        </CardContent>
      </Card>
    </div>
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-24' />
        </CardHeader>
        <CardContent className='space-y-4'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='flex items-center justify-between'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-20' />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-32' />
        </CardHeader>
        <CardContent className='space-y-4'>
          {[...Array(2)].map((_, i) => (
            <div key={i} className='flex items-center space-x-4'>
              <Skeleton className='h-10 w-10 rounded-full' />
              <div className='space-y-1'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-3 w-16' />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className='flex flex-col space-y-2'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
      </div>
    </div>
  </div>
);
