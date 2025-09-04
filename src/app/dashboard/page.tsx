'use client';

import useAxios from '@/hooks/use-axios';
import PageContainer from '@/components/layout/page-container';
import { useDashboardData } from '@/features/dashboard/api/dashboard-service';
import {
  useStatusCityStatistics,
  useDealershipRequestStatistics,
  useManagerRequestStatistics
} from '@/features/dashboard/api/dashboard-service';
import { StatusCityChart } from '@/features/dashboard/components/status-city-chart';
import { DealershipRequestChart } from '@/features/dashboard/components/dealership-request-chart';
import { ManagerRequestChart } from '@/features/dashboard/components/manager-request-chart';
import { DealershipBarChart } from '@/features/dashboard/components/dealership-bar-chart';
import { VehicleTypeBarChart } from '@/features/dashboard/components/vehicle-type-bar-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, StoreIcon, Users } from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const apiClient = useAxios();
  const { data, isLoading, refetch } = useDashboardData(apiClient);

  // State for month and year selection
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // New hook for status and city data
  const {
    data: statusCityData,
    isLoading: statusCityLoading,
    refetch: refetchStatusCity
  } = useStatusCityStatistics(apiClient, selectedMonth, selectedYear);

  // New hook for dealership request data
  const {
    data: dealershipRequestData,
    isLoading: dealershipRequestLoading,
    refetch: refetchDealershipRequest
  } = useDealershipRequestStatistics(apiClient, selectedMonth, selectedYear);

  // New hook for manager request data
  const {
    data: managerRequestData,
    isLoading: managerRequestLoading,
    refetch: refetchManagerRequest
  } = useManagerRequestStatistics(apiClient, selectedMonth, selectedYear);

  const handleRefresh = () => {
    refetch();
    refetchStatusCity();
    refetchDealershipRequest();
    refetchManagerRequest();
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Dashboard</h2>
            <p className='text-muted-foreground'>
              Vista general de las solicitudes de préstamos
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={
              isLoading ||
              statusCityLoading ||
              dealershipRequestLoading ||
              managerRequestLoading
            }
            className='self-start sm:self-auto'
          >
            {isLoading ||
            statusCityLoading ||
            dealershipRequestLoading ||
            managerRequestLoading ? (
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
          <TabsList className='grid w-full grid-cols-3 md:w-auto'>
            <TabsTrigger value='overview' className='flex items-center gap-2'>
              <ShieldCheck className='h-4 w-4' />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger
              value='dealership-requests'
              className='flex items-center gap-2'
            >
              <StoreIcon className='h-4 w-4' />
              <span>Concesionarias</span>
            </TabsTrigger>
            <TabsTrigger
              value='manager-requests'
              className='flex items-center gap-2'
            >
              <Users className='h-4 w-4' />
              <span>Gestores</span>
            </TabsTrigger>
            {/* <TabsTrigger
              value='dealerships'
              className='flex items-center gap-2'
            >
              <StoreIcon className='h-4 w-4' />
              <span>Concesionarios</span>
            </TabsTrigger>
            <TabsTrigger value='vehicles' className='flex items-center gap-2'>
              <CarIcon className='h-4 w-4' />
              <span>Vehículos</span>
            </TabsTrigger> */}
          </TabsList>

          <Separator />

          {/* Overview Tab - Status and City Chart */}
          <TabsContent value='overview' className='space-y-6'>
            <div className='space-y-2'>
              <StatusCityChart
                data={statusCityData}
                isLoading={statusCityLoading}
                onMonthChange={handleMonthChange}
                onYearChange={handleYearChange}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
              />
            </div>
          </TabsContent>

          {/* Dealership Requests Tab - Dealership Request Chart */}
          <TabsContent value='dealership-requests' className='space-y-6'>
            <DealershipRequestChart
              data={dealershipRequestData}
              isLoading={dealershipRequestLoading}
              onMonthChange={handleMonthChange}
              onYearChange={handleYearChange}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </TabsContent>

          {/* Manager Requests Tab - Manager Request Chart */}
          <TabsContent value='manager-requests' className='space-y-6'>
            <ManagerRequestChart
              data={managerRequestData}
              isLoading={managerRequestLoading}
              onMonthChange={handleMonthChange}
              onYearChange={handleYearChange}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </TabsContent>

          {/* Dealerships Tab - Dealership Bar Chart */}
          <TabsContent value='dealerships' className='space-y-6'>
            <DealershipBarChart
              data={data?.dealershipStats}
              isLoading={isLoading}
            />
          </TabsContent>

          {/* Vehicles Tab - Vehicle Type Bar Chart */}
          <TabsContent value='vehicles' className='space-y-6'>
            <VehicleTypeBarChart
              data={data?.vehicleTypeStats}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
