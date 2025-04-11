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
  YAxis
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { DealershipStatistics } from 'types/Dashboard';
import { DealershipBarSkeleton } from './dealership-bar-skeleton';
import { StoreIcon } from 'lucide-react';

interface DealershipBarChartProps {
  data?: DealershipStatistics;
  isLoading: boolean;
}

export function DealershipBarChart({
  data,
  isLoading
}: DealershipBarChartProps) {
  if (isLoading) {
    return <DealershipBarSkeleton />;
  }

  if (!data || !data.dealerships.length) {
    return null;
  }

  // Sort dealerships by request count in descending order
  const sortedDealerships = [...data.dealerships]
    .sort((a, b) => b.requestCount - a.requestCount)
    .filter((d) => d.requestCount > 0) // Only show dealerships with requests
    .slice(0, 10); // Limit to top 10 dealerships

  // Format data for the chart
  const chartData = sortedDealerships.map((d) => ({
    name: d.dealershipName,
    count: d.requestCount
  }));

  // Calculate total requests
  const totalRequests = sortedDealerships.reduce(
    (sum, dealer) => sum + dealer.requestCount,
    0
  );

  return (
    <Card className='w-full'>
      <CardHeader className='flex flex-row items-start justify-between'>
        <div>
          <CardTitle>Solicitudes por Concesionario</CardTitle>
          <CardDescription>
            Top {chartData.length} concesionarios con mayor número de
            solicitudes
          </CardDescription>
        </div>
        <div className='bg-primary-50 dark:bg-primary-900/20 rounded-md p-2'>
          <StoreIcon className='text-primary-700 dark:text-primary-400 h-5 w-5' />
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
              Concesionarios activos
            </span>
            <span className='text-lg font-bold'>{chartData.length}</span>
          </div>
        </div>

        <div className='h-[420px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 60 // Extra space for rotated labels
              }}
              barSize={30}
            >
              <CartesianGrid strokeDasharray='3 3' vertical={false} />
              <XAxis
                dataKey='name'
                angle={-45}
                textAnchor='end'
                height={80}
                tick={{ fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis tickFormatter={(value) => `${value}`} />
              <Tooltip
                formatter={(value) => [`${value} solicitudes`, 'Solicitudes']}
                labelFormatter={(label) => `Concesionario: ${label}`}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar dataKey='count' radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`hsl(${210 + index * 10}, 80%, ${75 - index * 3}%)`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
