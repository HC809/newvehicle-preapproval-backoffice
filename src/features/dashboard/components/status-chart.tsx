'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Pie, PieChart, Label, Cell } from 'recharts';
import { LoanRequestStatistics } from 'types/Dashboard';
import { translateStatus } from '@/utils/getStatusColor';
import { LoanRequestStatus } from 'types/LoanRequests';
import { Skeleton } from '@/components/ui/skeleton';
import * as React from 'react';

interface StatusChartProps {
  data?: LoanRequestStatistics;
  isLoading: boolean;
}

export function StatusChart({ data, isLoading }: StatusChartProps) {
  // Calculate total for center of pie chart - moved outside conditional logic
  const totalRequests = React.useMemo(
    () => data?.totalRequests || 0,
    [data?.totalRequests]
  );

  if (isLoading) {
    return <Skeleton className='h-[400px] w-full rounded-lg' />;
  }

  if (!data) {
    return null;
  }

  // Filter out Cancelled status
  const filteredStatuses = Object.entries(data.requestsByStatus)
    .filter(([status]) => status !== LoanRequestStatus.Cancelled)
    .reduce(
      (acc, [status, count]) => {
        acc[status as LoanRequestStatus] = count;
        return acc;
      },
      {} as Record<LoanRequestStatus, number>
    );

  // Transform the data for the chart
  const chartData = Object.entries(filteredStatuses).map(([status, count]) => ({
    status: status as LoanRequestStatus,
    label: translateStatus(status as LoanRequestStatus),
    value: count,
    fill: getStatusColor(status as LoanRequestStatus)
  }));

  // Create chart configuration
  const chartConfig = {
    value: {
      label: 'Solicitudes'
    },
    ...Object.fromEntries(
      Object.keys(filteredStatuses).map((status) => [
        status,
        {
          label: translateStatus(status as LoanRequestStatus),
          color: getStatusColor(status as LoanRequestStatus)
        }
      ])
    )
  } as ChartConfig;

  return (
    <Card className='col-span-full md:col-span-6'>
      <CardHeader>
        <CardTitle>Distribución de Solicitudes</CardTitle>
        <CardDescription>
          Distribución por estado de solicitudes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[350px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  nameKey='label'
                  formatter={(value) => [`${value} solicitudes`]}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey='value'
              nameKey='status'
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  stroke='var(--background)'
                  strokeWidth={2}
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {totalRequests}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 25}
                          className='fill-muted-foreground text-sm'
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Helper function to get status colors for chart
function getStatusColor(status: LoanRequestStatus): string {
  switch (status) {
    case LoanRequestStatus.Pending:
      return 'hsl(40, 95%, 70%)'; // More pastel amber
    case LoanRequestStatus.ApprovedByAgent:
    case LoanRequestStatus.ApprovedByManager:
      return 'hsl(142, 70%, 70%)'; // More pastel green
    case LoanRequestStatus.RejectedByAgent:
    case LoanRequestStatus.RejectedByManager:
      return 'hsl(0, 90%, 75%)'; // More pastel red
    case LoanRequestStatus.AcceptedByCustomer:
      return 'hsl(210, 80%, 75%)'; // More pastel blue
    case LoanRequestStatus.DeclinedByCustomer:
      return 'hsl(220, 15%, 75%)'; // More pastel gray
    default:
      return 'hsl(var(--muted))';
  }
}
