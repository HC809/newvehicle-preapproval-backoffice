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
  Tooltip,
  Cell
} from 'recharts';
import { StatusCityStatistics } from 'types/Dashboard';
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
import { useState, useMemo } from 'react';
import { translateStatus } from '@/utils/getStatusColor';
import { LoanRequestStatus } from 'types/LoanRequests';

interface StatusCityChartProps {
  data?: StatusCityStatistics;
  isLoading: boolean;
  onMonthChange?: (month: number) => void;
  onYearChange?: (year: number) => void;
}

const cityColors = {
  sanPedroSula: '#10b981', // green
  tegucigalpa: '#3b82f6', // blue
  ceiba: '#f59e0b', // amber
  unassigned: '#6b7280', // gray
  unidentified: '#ef4444' // red
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

// Helper function to get short status name for better display
function getShortStatusName(status: string): string {
  switch (status) {
    case 'Pending':
      return 'Pendiente';
    case 'ApprovedByAgent':
      return 'Aprob. Oficial';
    case 'ApprovedByManager':
      return 'Aprob. Gerente';
    case 'ApprovedForCommittee':
      return 'Aprob. Comité';
    case 'RejectedByAgent':
      return 'Rech. Oficial';
    case 'RejectedByManager':
      return 'Rech. Gerente';
    case 'AcceptedByCustomer':
      return 'Aceptado';
    case 'VisitAssigned':
      return 'Visita Asignada';
    case 'VisitRegistered':
      return 'Visita Registrada';
    case 'DeclinedByCustomer':
      return 'Cliente Desistió';
    case 'Cancelled':
      return 'Cancelado';
    case 'BranchManagerReview':
      return 'Revisión Gerente';
    case 'Completed':
      return 'Completado';
    default:
      return status;
  }
}

// Helper function to get status color for bars based on getStatusColor.ts
function getStatusColor(status: string): string {
  switch (status) {
    case 'Pending':
      return '#eab308'; // yellow-500
    case 'ApprovedByAgent':
      return '#16a34a'; // green-600
    case 'ApprovedByManager':
      return '#15803d'; // green-700
    case 'ApprovedForCommittee':
      return '#2563eb'; // blue-600
    case 'RejectedByAgent':
      return '#dc2626'; // red-600
    case 'RejectedByManager':
      return '#b91c1c'; // red-700
    case 'AcceptedByCustomer':
      return '#2563eb'; // blue-600
    case 'VisitAssigned':
      return '#7c3aed'; // purple-600
    case 'VisitRegistered':
      return '#6b21a8'; // purple-800
    case 'DeclinedByCustomer':
      return '#6b7280'; // gray-500
    case 'Cancelled':
      return '#6b7280'; // gray-500
    case 'BranchManagerReview':
      return '#4f46e5'; // indigo-600
    case 'Completed':
      return '#059669'; // emerald-600
    default:
      return '#6b7280'; // gray-500
  }
}

// Helper function to get soft background color for table rows
function getStatusBackgroundColor(status: string): string {
  switch (status) {
    case 'Pending':
      return 'rgba(234, 179, 8, 0.08)'; // yellow-500 with 8% opacity
    case 'ApprovedByAgent':
      return 'rgba(22, 163, 74, 0.08)'; // green-600 with 8% opacity
    case 'ApprovedByManager':
      return 'rgba(21, 128, 61, 0.08)'; // green-700 with 8% opacity
    case 'ApprovedForCommittee':
      return 'rgba(37, 99, 235, 0.08)'; // blue-600 with 8% opacity
    case 'RejectedByAgent':
      return 'rgba(220, 38, 38, 0.08)'; // red-600 with 8% opacity
    case 'RejectedByManager':
      return 'rgba(185, 28, 28, 0.08)'; // red-700 with 8% opacity
    case 'AcceptedByCustomer':
      return 'rgba(37, 99, 235, 0.08)'; // blue-600 with 8% opacity
    case 'VisitAssigned':
      return 'rgba(124, 58, 237, 0.08)'; // purple-600 with 8% opacity
    case 'VisitRegistered':
      return 'rgba(107, 33, 168, 0.08)'; // purple-800 with 8% opacity
    case 'DeclinedByCustomer':
      return 'rgba(107, 114, 128, 0.08)'; // gray-500 with 8% opacity
    case 'Cancelled':
      return 'rgba(107, 114, 128, 0.08)'; // gray-500 with 8% opacity
    case 'BranchManagerReview':
      return 'rgba(79, 70, 229, 0.08)'; // indigo-600 with 8% opacity
    case 'Completed':
      return 'rgba(5, 150, 105, 0.08)'; // emerald-600 with 8% opacity
    default:
      return 'rgba(107, 114, 128, 0.08)'; // gray-500 with 8% opacity
  }
}

export function StatusCityChart({
  data,
  isLoading,
  onMonthChange,
  onYearChange
}: StatusCityChartProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );

  // Transform data for the stacked bar chart
  const chartData = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((item) => ({
      status: translateStatus(item.status as LoanRequestStatus),
      shortStatus: getShortStatusName(item.status),
      'San Pedro Sula': item.sanPedroSulaCount,
      Tegucigalpa: item.tegucigalpaCount,
      Ceiba: item.ceibaCount,
      'Sin Asignar': item.unassignedCount,
      'No Identificado': item.unidentifiedCount,
      total: item.totalCount,
      originalStatus: item.status, // Keep original status for color mapping
      statusColor: getStatusColor(item.status), // Add status color
      backgroundColor: getStatusBackgroundColor(item.status) // Add background color
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
    setSelectedMonth(month);
    onMonthChange?.(month);
  };

  const handleYearChange = (value: string) => {
    const year = parseInt(value);
    setSelectedYear(year);
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
            <CardTitle>Distribución por Estado y Ciudad</CardTitle>
            <CardDescription>
              Solicitudes de préstamos por estado y ciudad para{' '}
              {selectedMonthName} {selectedYear}
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
                    <TableHead>Estado</TableHead>
                    <TableHead className='text-center'>
                      San Pedro Sula
                    </TableHead>
                    <TableHead className='text-center'>Tegucigalpa</TableHead>
                    <TableHead className='text-center'>La Ceiba</TableHead>
                    <TableHead className='text-center'>Sin Asignar</TableHead>
                    <TableHead className='text-center'>
                      No Identificado
                    </TableHead>
                    <TableHead className='text-center font-bold'>
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.map((item) => (
                    <TableRow
                      key={item.originalStatus}
                      style={{ backgroundColor: item.backgroundColor }}
                      className='transition-opacity hover:opacity-80'
                    >
                      <TableCell className='font-medium'>
                        {item.status}
                      </TableCell>
                      <TableCell className='text-center'>
                        {item['San Pedro Sula']}
                      </TableCell>
                      <TableCell className='text-center'>
                        {item.Tegucigalpa}
                      </TableCell>
                      <TableCell className='text-center'>
                        {item.Ceiba}
                      </TableCell>
                      <TableCell className='text-center'>
                        {item['Sin Asignar']}
                      </TableCell>
                      <TableCell className='text-center'>
                        {item['No Identificado']}
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
                        (sum, item) => sum + item['San Pedro Sula'],
                        0
                      )}
                    </TableCell>
                    <TableCell className='text-center font-bold'>
                      {chartData.reduce(
                        (sum, item) => sum + item.Tegucigalpa,
                        0
                      )}
                    </TableCell>
                    <TableCell className='text-center font-bold'>
                      {chartData.reduce((sum, item) => sum + item.Ceiba, 0)}
                    </TableCell>
                    <TableCell className='text-center font-bold'>
                      {chartData.reduce(
                        (sum, item) => sum + item['Sin Asignar'],
                        0
                      )}
                    </TableCell>
                    <TableCell className='text-center font-bold'>
                      {chartData.reduce(
                        (sum, item) => sum + item['No Identificado'],
                        0
                      )}
                    </TableCell>
                    <TableCell className='text-center font-bold'>
                      {chartData.reduce((sum, item) => sum + item.total, 0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value='chart' className='space-y-4'>
            <div className='h-[400px] w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='shortStatus'
                    angle={-45}
                    textAnchor='end'
                    height={80}
                    fontSize={12}
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
                              maxWidth: '300px'
                            }}
                          >
                            <p className='mb-3 text-base font-bold text-gray-900 dark:text-gray-100'>
                              {data.status}
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
                                    backgroundColor: cityColors.sanPedroSula,
                                    borderRadius: '50%',
                                    marginRight: '8px'
                                  }}
                                ></div>
                                San Pedro Sula: {data['San Pedro Sula']}
                              </div>
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
                                    backgroundColor: cityColors.tegucigalpa,
                                    borderRadius: '50%',
                                    marginRight: '8px'
                                  }}
                                ></div>
                                Tegucigalpa: {data.Tegucigalpa}
                              </div>
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
                                    backgroundColor: cityColors.ceiba,
                                    borderRadius: '50%',
                                    marginRight: '8px'
                                  }}
                                ></div>
                                La Ceiba: {data.Ceiba}
                              </div>
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
                                    backgroundColor: cityColors.unassigned,
                                    borderRadius: '50%',
                                    marginRight: '8px'
                                  }}
                                ></div>
                                Sin Asignar: {data['Sin Asignar']}
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
                                    backgroundColor: cityColors.unidentified,
                                    borderRadius: '50%',
                                    marginRight: '8px'
                                  }}
                                ></div>
                                No Identificado: {data['No Identificado']}
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
                  <Bar dataKey='total' fill='#6b7280' name='Total'>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.statusColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend for status colors */}
            <div className='flex flex-wrap justify-center gap-4'>
              {chartData.map((item) => (
                <div
                  key={item.originalStatus}
                  className='flex items-center space-x-2'
                >
                  <div
                    className='h-3 w-3 rounded-full'
                    style={{ backgroundColor: item.statusColor }}
                  />
                  <span className='text-sm text-muted-foreground'>
                    {item.shortStatus}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
