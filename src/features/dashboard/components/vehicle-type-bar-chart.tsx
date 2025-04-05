'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { VehicleTypeStatistics } from 'types/Dashboard';
import { VehicleTypeBarSkeleton } from './vehicle-type-bar-skeleton';
import { CarIcon } from 'lucide-react';

interface VehicleTypeBarChartProps {
  data?: VehicleTypeStatistics;
  isLoading: boolean;
}

export function VehicleTypeBarChart({
  data,
  isLoading
}: VehicleTypeBarChartProps) {
  if (isLoading) {
    return <VehicleTypeBarSkeleton />;
  }

  if (!data || !data.vehicleTypes.length) {
    return null;
  }

  // Sort vehicle types by request count in descending order
  const sortedVehicleTypes = [...data.vehicleTypes]
    .sort((a, b) => b.requestCount - a.requestCount)
    .filter((v) => v.requestCount > 0); // Only show vehicle types with requests

  // Format data for the chart
  const chartData = sortedVehicleTypes.map((v) => ({
    name: v.vehicleTypeName,
    count: v.requestCount
  }));

  // Calculate total requests
  const totalRequests = sortedVehicleTypes.reduce(
    (sum, vehicleType) => sum + vehicleType.requestCount,
    0
  );

  const getVehicleColor = (index: number) => {
    // Different color range from dealership chart
    return `hsl(${180 + index * 25}, 70%, 55%)`;
  };

  return (
    <Card className='w-full'>
      <CardHeader className='flex flex-row items-start justify-between'>
        <div>
          <CardTitle>Solicitudes por Tipo de Vehículo</CardTitle>
          <CardDescription>
            Distribución de solicitudes según el tipo de vehículo
          </CardDescription>
        </div>
        <div className='rounded-md bg-cyan-50 p-2 dark:bg-cyan-900/20'>
          <CarIcon className='h-5 w-5 text-cyan-700 dark:text-cyan-400' />
        </div>
      </CardHeader>
      <CardContent className='pt-4'>
        <div className='mb-4 flex flex-col gap-1'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>
              Total solicitudes
            </span>
            <span className='text-lg font-bold'>{totalRequests}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>
              Tipos de vehículos activos
            </span>
            <span className='text-lg font-bold'>{chartData.length}</span>
          </div>
        </div>

        <div className='h-[400px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={chartData}
              layout='vertical'
              margin={{
                top: 20,
                right: 30,
                left: 25,
                bottom: 5
              }}
              barSize={30}
            >
              <CartesianGrid strokeDasharray='3 3' horizontal={false} />
              <XAxis type='number' tickFormatter={(value) => `${value}`} />
              <YAxis
                type='category'
                dataKey='name'
                tick={{ fontSize: 12 }}
                width={130}
              />
              <Tooltip
                formatter={(value) => [`${value} solicitudes`, 'Solicitudes']}
                labelFormatter={(label) => `Tipo: ${label}`}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar dataKey='count' radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getVehicleColor(index)} />
                ))}
                <LabelList
                  dataKey='count'
                  position='right'
                  style={{ fontWeight: 'bold' }}
                  formatter={(value: number) => value}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
