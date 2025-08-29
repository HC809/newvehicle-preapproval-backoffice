'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SaveIcon, Loader2, Copy, User, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAssignReferredLoanRequest } from '../api/loan-request-service';
import useAxios from '@/hooks/use-axios';
import { useVehicleTypes } from '@/features/vehicle-types/api/vehicle-type-service';
import { useDealerships } from '@/features/dealerships/api/dealership-service';
import { useUsers } from '@/features/users/api/user-service';
import { UserRole } from 'types/User';
import { toast } from 'sonner';
import { NumberInput } from '@/components/number-input';
import { SearchableSelect } from '@/components/searchable-select';
import { useCities } from '@/features/cities/api/city-service';
import { LoanRequest } from 'types/LoanRequests';
import { formatPhoneNumber } from '@/utils/formatPhoneNumber';

const formSchema = z.object({
  monthlyIncome: z.number().nullable().optional(),
  vehicleTypeId: z.string().min(1, {
    message: 'Debe seleccionar un tipo de vehículo.'
  }),
  requestedAmount: z
    .number({
      required_error: 'El valor del vehículo es requerido.',
      invalid_type_error: 'El valor del vehículo debe ser un número.'
    })
    .min(0.01, {
      message: 'El valor del vehículo debe ser mayor a 0.'
    }),
  vehicleBrand: z.string().min(1, {
    message: 'La marca del vehículo es requerida.'
  }),
  vehicleModel: z.string().min(1, {
    message: 'El modelo del vehículo es requerido.'
  }),
  vehicleYear: z.number().min(1900, {
    message: 'El año del vehículo debe ser válido.'
  }),
  dealershipId: z.string().min(1, {
    message: 'Debe seleccionar una concesionaria.'
  }),
  dealershipAdminId: z.string().min(1, {
    message: 'Debe seleccionar un administrador de concesionaria.'
  }),
  city: z.string().min(1, {
    message: 'La ciudad es requerida.'
  })
});

type FormValues = z.input<typeof formSchema>;

type AssignReferredLoanRequestFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanRequest: LoanRequest | null;
};

export default function AssignReferredLoanRequestForm({
  open,
  onOpenChange,
  loanRequest
}: AssignReferredLoanRequestFormProps) {
  const apiClient = useAxios();
  const assignReferredLoanRequestMutation =
    useAssignReferredLoanRequest(apiClient);

  const {
    data: vehicleTypes = [],
    isLoading: isVehicleTypesLoading,
    isFetching: isVehicleTypesFetching,
    isSuccess: isVehicleTypesSuccess
  } = useVehicleTypes(apiClient, open);

  const {
    data: dealerships = [],
    isLoading: isDealershipsLoading,
    isFetching: isDealershipsFetching,
    isSuccess: isDealershipsSuccess
  } = useDealerships(apiClient, open);

  const {
    data: users = [],
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
    isSuccess: isUsersSuccess
  } = useUsers(apiClient, open);

  const {
    data: cities = [],
    isLoading: isCitiesLoading,
    isFetching: isCitiesFetching,
    isSuccess: isCitiesSuccess
  } = useCities(apiClient);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyIncome: null,
      vehicleTypeId: '',
      requestedAmount: 0,
      vehicleBrand: '',
      vehicleModel: '',
      vehicleYear: new Date().getFullYear(),
      dealershipId: '',
      dealershipAdminId: '',
      city: ''
    },
    mode: 'onChange'
  });

  const selectedDealershipId = form.watch('dealershipId');

  const dealershipAdmins = useMemo(() => {
    return users.filter(
      (user) =>
        user.role === UserRole.Dealership_Admin &&
        user.dealershipId === selectedDealershipId
    );
  }, [users, selectedDealershipId]);

  const resetForm = useCallback(() => {
    form.reset();
  }, [form]);

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      if (!loanRequest) return;

      const result = formSchema.safeParse(values);

      if (!result.success) {
        return;
      }

      const transformedValues = {
        loanRequestId: loanRequest.id,
        monthlyIncome:
          result.data.monthlyIncome === null ||
          result.data.monthlyIncome === undefined
            ? null
            : result.data.monthlyIncome,
        vehicleTypeId: result.data.vehicleTypeId,
        requestedAmount: result.data.requestedAmount,
        vehicleBrand: result.data.vehicleBrand,
        vehicleModel: result.data.vehicleModel,
        vehicleYear: result.data.vehicleYear,
        dealershipId: result.data.dealershipId,
        dealershipAdminId: result.data.dealershipAdminId,
        city: result.data.city
      };

      assignReferredLoanRequestMutation.mutate(transformedValues, {
        onSuccess: () => {
          resetForm();
          onOpenChange(false);
          toast.success('Solicitud asignada correctamente', {
            description:
              'La solicitud referida ha sido asignada y convertida en una solicitud completa.'
          });
        },
        onError: (error) => {
          toast.error('Error al asignar la solicitud', {
            description: error.message
          });
        }
      });
    },
    [assignReferredLoanRequestMutation, resetForm, onOpenChange, loanRequest]
  );

  const isFormLocked = assignReferredLoanRequestMutation.isPending;

  const handleClose = useCallback(() => {
    if (isFormLocked) return;
    resetForm();
    assignReferredLoanRequestMutation.reset();
    onOpenChange(false);
  }, [
    resetForm,
    onOpenChange,
    assignReferredLoanRequestMutation,
    isFormLocked
  ]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  // Estados para los botones de copiar
  const [copiedDNI, setCopiedDNI] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const copyDNI = () => {
    if (loanRequest?.dni) {
      navigator.clipboard.writeText(loanRequest.dni);
      setCopiedDNI(true);
      setTimeout(() => setCopiedDNI(false), 2000);
    }
  };

  const copyPhone = () => {
    if (loanRequest?.phoneNumber) {
      navigator.clipboard.writeText(loanRequest.phoneNumber);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const isLoading =
    isVehicleTypesLoading ||
    isVehicleTypesFetching ||
    !isVehicleTypesSuccess ||
    isDealershipsLoading ||
    isDealershipsFetching ||
    !isDealershipsSuccess ||
    isUsersLoading ||
    isUsersFetching ||
    !isUsersSuccess ||
    isCitiesLoading ||
    isCitiesFetching ||
    !isCitiesSuccess;

  if (!loanRequest) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpenState) => {
        if (!newOpenState && isFormLocked) return;
        onOpenChange(newOpenState);
      }}
    >
      <DialogContent
        className='max-h-[90vh] overflow-y-auto sm:max-w-[725px]'
        onEscapeKeyDown={(event) => {
          if (isFormLocked) {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (isFormLocked) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader className='space-y-2'>
          <DialogTitle className='break-words text-lg md:text-xl'>
            Asignar Solicitud Referida
          </DialogTitle>
          <DialogDescription className='break-words text-sm md:text-base'>
            Complete los datos para convertir esta solicitud referida en una
            solicitud completa.
          </DialogDescription>
        </DialogHeader>

        {/* Información del referido (no editable) */}
        <div className='space-y-4 rounded-lg border bg-gray-50 p-4 dark:bg-gray-800'>
          <h3 className='font-medium text-gray-900 dark:text-gray-100'>
            Información del Referido
          </h3>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-green-500 dark:text-green-400' />
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  DNI del Cliente
                </p>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-green-700 dark:text-green-300'>
                    {loanRequest.dni}
                  </span>
                  <button
                    onClick={copyDNI}
                    className='rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-600'
                    title='Copiar DNI'
                  >
                    <Copy className='h-3 w-3 text-gray-500' />
                  </button>
                  {copiedDNI && (
                    <span className='text-xs text-green-500'>¡Copiado!</span>
                  )}
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-blue-500 dark:text-blue-400' />
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Número de Teléfono
                </p>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-blue-700 dark:text-blue-300'>
                    {formatPhoneNumber(loanRequest.phoneNumber || '')}
                  </span>
                  <button
                    onClick={copyPhone}
                    className='rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-600'
                    title='Copiar teléfono'
                  >
                    <Copy className='h-3 w-3 text-gray-500' />
                  </button>
                  {copiedPhone && (
                    <span className='text-xs text-green-500'>¡Copiado!</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className='flex items-start gap-2'>
            <FileText className='mt-0.5 h-4 w-4 text-amber-500' />
            <div className='flex-1'>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Información del Referido
              </p>
              <div className='mt-1 rounded-md border bg-white p-3 dark:bg-gray-700'>
                <p className='whitespace-pre-line text-sm text-gray-600 dark:text-gray-300'>
                  {loanRequest.comment || 'Sin información adicional'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className='flex h-40 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className='space-y-4 md:space-y-6'
            >
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='monthlyIncome'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ingreso Mensual</FormLabel>
                        <FormControl>
                          <NumberInput
                            placeholder='Ingrese el ingreso mensual'
                            thousandSeparator=','
                            prefix='L '
                            step={0.01}
                            decimalScale={2}
                            fixedDecimalScale={false}
                            value={field.value || undefined}
                            onValueChange={(value: number | undefined) => {
                              field.onChange(
                                value === undefined ? null : value
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='vehicleTypeId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Vehículo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Seleccione un tipo de vehículo' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicleTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='requestedAmount'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor del Vehículo</FormLabel>
                        <FormControl>
                          <NumberInput
                            placeholder='Ingrese el monto solicitado'
                            thousandSeparator=','
                            prefix='L '
                            step={0.01}
                            decimalScale={2}
                            fixedDecimalScale={false}
                            value={field.value}
                            onValueChange={(value: number | undefined) => {
                              field.onChange(value === undefined ? 0 : value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='vehicleYear'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año del Vehículo</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                            placeholder='Ingrese el año'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='vehicleBrand'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca del Vehículo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='Ingrese la marca' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='vehicleModel'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo del Vehículo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='Ingrese el modelo' />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='dealershipId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Concesionaria</FormLabel>
                        <FormControl>
                          <SearchableSelect
                            options={dealerships.map((d) => ({
                              value: d.id,
                              label: d.name
                            }))}
                            placeholder='Seleccione una concesionaria'
                            searchPlaceholder='Buscar concesionaria...'
                            value={field.value || ''}
                            onSelect={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='dealershipAdminId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asesor de Concesionaria</FormLabel>
                        <FormControl>
                          <SearchableSelect
                            options={dealershipAdmins.map((a) => ({
                              value: a.id,
                              label: a.name
                            }))}
                            placeholder='Seleccione un asesor'
                            searchPlaceholder='Buscar asesor...'
                            value={field.value || ''}
                            onSelect={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={cities.map((city: string) => ({
                            value: city,
                            label: city
                          }))}
                          placeholder='Seleccione una ciudad'
                          searchPlaceholder='Buscar ciudad...'
                          value={field.value || ''}
                          onSelect={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {assignReferredLoanRequestMutation.error && (
                <Alert variant='destructive'>
                  <AlertDescription>
                    {String(assignReferredLoanRequestMutation.error)}
                  </AlertDescription>
                </Alert>
              )}

              <div className='mt-6 flex flex-col justify-end gap-4 sm:flex-row'>
                <Button
                  variant='outline'
                  type='button'
                  disabled={isFormLocked}
                  onClick={handleClose}
                  className='w-full sm:w-auto'
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  disabled={isFormLocked}
                  className='w-full sm:w-auto'
                >
                  {isFormLocked ? (
                    <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <SaveIcon className='mr-2 h-4 w-4' />
                  )}
                  {isFormLocked ? 'Asignando...' : 'Asignar Solicitud'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
