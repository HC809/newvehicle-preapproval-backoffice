'use client';

import useAxios from '@/hooks/use-axios';
import PageContainer from '@/components/layout/page-container';
import { useDashboardData } from '@/features/dashboard/api/dashboard-service';
import { StatusStatistics } from '@/features/dashboard/components/status-statistics';
import { StatusChart } from '@/features/dashboard/components/status-chart';
import { DealershipBarChart } from '@/features/dashboard/components/dealership-bar-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BarChart4, PieChart, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const apiClient = useAxios();
  const { data, isLoading, refetch } = useDashboardData(apiClient);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Panel de Control
            </h2>
            <p className='text-muted-foreground'>
              Vista general de las solicitudes de préstamos
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refetch()}
            disabled={isLoading}
            className='self-start sm:self-auto'
          >
            {isLoading ? (
              <>
                <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                Cargando...
              </>
            ) : (
              <>
                <ReloadIcon className='mr-2 h-4 w-4' />
                Actualizar
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue='overview' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-2 md:w-auto'>
            <TabsTrigger value='overview' className='flex items-center gap-2'>
              <ShieldCheck className='h-4 w-4' />
              <span>Estado</span>
            </TabsTrigger>
            <TabsTrigger value='detailed' className='flex items-center gap-2'>
              <BarChart4 className='h-4 w-4' />
              <span>Concesionarios</span>
            </TabsTrigger>
          </TabsList>

          <Separator />

          {/* Overview Tab - Status Cards */}
          <TabsContent value='overview' className='space-y-6'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <ShieldCheck className='text-primary-600 h-5 w-5' />
                <h3 className='text-lg font-medium'>Estado de Solicitudes</h3>
              </div>
              <p className='text-sm text-muted-foreground'>
                Distribución por estado de todas las solicitudes de préstamos
              </p>
              <StatusStatistics
                data={data?.loanRequestStats}
                isLoading={isLoading}
              />
            </div>

            {/* Visualization section - temporarily commented out
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Visualización</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                    <StatusChart data={data?.loanRequestStats} isLoading={isLoading} />
                    
                    Additional charts can be added here
                </div>
            </div>
            */}
          </TabsContent>

          {/* Detailed Tab - Dealership Bar Chart */}
          <TabsContent value='detailed' className='space-y-6'>
            <DealershipBarChart
              data={data?.dealershipStats}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
