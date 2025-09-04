'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { ManagerRequestStatistics } from 'types/Dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useMemo } from 'react';

interface ManagerRequestChartProps {
  data?: ManagerRequestStatistics;
  isLoading: boolean;
  onMonthChange?: (month: number) => void;
  onYearChange?: (year: number) => void;
}

const requestTypeColors = {
  regular: '#3b82f6', // blue
  referred: '#f59e0b' // amber
};

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

// Helper function to truncate long manager names
function truncateManagerName(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
}

export function ManagerRequestChart({
  data,
  isLoading,
  onMonthChange,
  onYearChange,
  selectedMonth: externalSelectedMonth,
  selectedYear: externalSelectedYear
}: ManagerRequestChartProps & {
  selectedMonth?: number;
  selectedYear?: number;
}) {
  const selectedMonth = externalSelectedMonth ?? new Date().getMonth() + 1;
  const selectedYear = externalSelectedYear ?? new Date().getFullYear();

  // Transform data for the chart
  const chartData = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((item) => ({
      manager: item.managerName,
      managerShort: truncateManagerName(item.managerName),
      'Solicitudes Regulares': item.regularRequestsCount,
      'Solicitudes Referidas Sin Asignar': item.referredUnassignedCount,
      total: item.totalRequests
    }));
  }, [data]);

  // Generate month options
  const monthOptions = monthNames.map((name, index) => ({
    value: index + 1,
    label: name
  }));

  // Generate year options (current year and 2 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);

  const handleMonthChange = (value: string) => {
    const month = parseInt(value);
    onMonthChange?.(month);
  };

  const handleYearChange = (value: string) => {
    const year = parseInt(value);
    onYearChange?.(year);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-4 w-64' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[400px] w-full' />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  // Format the selected month for display
  const selectedMonthName = monthNames[selectedMonth - 1];

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
          <div>
            <CardTitle>Solicitudes por Gestor</CardTitle>
            <CardDescription>
              Distribución de solicitudes por gestor para {selectedMonthName}{' '}
              {selectedYear}
            </CardDescription>
          </div>
          <div className='flex space-x-2'>
            <Select
              value={selectedMonth.toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className='w-[140px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedYear.toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className='w-[100px]'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='table' className='space-y-4'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='table'>Tabla</TabsTrigger>
            <TabsTrigger value='chart'>Gráfico</TabsTrigger>
          </TabsList>

          <TabsContent value='table' className='space-y-4'>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gestor</TableHead>
                    <TableHead className='text-center'>
                      Solicitudes Regulares
                    </TableHead>
                    <TableHead className='text-center'>
                      Referidas Sin Asignar
                    </TableHead>
                    <TableHead className='text-center font-bold'>
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.map((item, index) => (
                    <TableRow
                      key={index}
                      className='transition-opacity hover:opacity-80'
                    >
                      <TableCell className='font-medium' title={item.manager}>
                        {item.manager}
                      </TableCell>
                      <TableCell className='text-center'>
                        {item['Solicitudes Regulares']}
                      </TableCell>
                      <TableCell className='text-center'>
                        {item['Solicitudes Referidas Sin Asignar']}
                      </TableCell>
                      <TableCell className='text-center font-bold'>
                        {item.total}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className='bg-muted/50'>
                    <TableCell className='font-bold'>Total General</TableCell>
                    <TableCell className='text-center font-bold'>
                      {chartData.reduce(
                        (sum, item) => sum + item['Solicitudes Regulares'],
                        0
                      )}
                    </TableCell>
                    <TableCell className='text-center font-bold'>
                      {chartData.reduce(
                        (sum, item) =>
                          sum + item['Solicitudes Referidas Sin Asignar'],
                        0
                      )}
                    </TableCell>
                    <TableCell className='text-center font-bold'>
                      {data.totalRequests}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value='chart' className='space-y-4'>
            <div className='h-[400px] w-full overflow-x-auto'>
              <div
                style={{
                  minWidth: `${Math.max(800, chartData.length * 120)}px`,
                  height: '100%'
                }}
              >
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='managerShort'
                      angle={-45}
                      textAnchor='end'
                      height={100}
                      fontSize={12}
                      interval={0}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div
                              className='rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800'
                              style={{
                                padding: '16px',
                                minWidth: '200px',
                                maxWidth: '350px'
                              }}
                            >
                              <p className='mb-3 text-base font-bold text-gray-900 dark:text-gray-100'>
                                {data.manager}
                              </p>
                              <div className='text-sm text-gray-600 dark:text-gray-300'>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '4px'
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '12px',
                                      height: '12px',
                                      backgroundColor:
                                        requestTypeColors.regular,
                                      borderRadius: '50%',
                                      marginRight: '8px'
                                    }}
                                  ></div>
                                  Solicitudes Regulares:{' '}
                                  {data['Solicitudes Regulares']}
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '12px',
                                      height: '12px',
                                      backgroundColor:
                                        requestTypeColors.referred,
                                      borderRadius: '50%',
                                      marginRight: '8px'
                                    }}
                                  ></div>
                                  Referidas Sin Asignar:{' '}
                                  {data['Solicitudes Referidas Sin Asignar']}
                                </div>
                                <div className='mt-2 border-t border-gray-200 pt-3 font-bold text-gray-900 dark:border-gray-600 dark:text-gray-100'>
                                  Total: {data.total}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey='Solicitudes Regulares'
                      stackId='a'
                      fill={requestTypeColors.regular}
                      name='Solicitudes Regulares'
                    />
                    <Bar
                      dataKey='Solicitudes Referidas Sin Asignar'
                      stackId='a'
                      fill={requestTypeColors.referred}
                      name='Solicitudes Referidas Sin Asignar'
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Legend */}
            <div className='flex flex-wrap justify-center gap-4'>
              <div className='flex items-center space-x-2'>
                <div
                  className='h-3 w-3 rounded-full'
                  style={{ backgroundColor: requestTypeColors.regular }}
                />
                <span className='text-sm text-muted-foreground'>
                  Solicitudes Regulares
                </span>
              </div>
              <div className='flex items-center space-x-2'>
                <div
                  className='h-3 w-3 rounded-full'
                  style={{ backgroundColor: requestTypeColors.referred }}
                />
                <span className='text-sm text-muted-foreground'>
                  Solicitudes Referidas Sin Asignar
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
