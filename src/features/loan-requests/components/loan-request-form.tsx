'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
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
import { SaveIcon, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateLoanRequest } from '../api/loan-request-service';
import useAxios from '@/hooks/use-axios';
import { useVehicleTypes } from '@/features/vehicle-types/api/vehicle-type-service';
import { useDealerships } from '@/features/dealerships/api/dealership-service';
import { useUsers } from '@/features/users/api/user-service';
import { UserRole } from 'types/User';
import { toast } from 'sonner';
import { CreateLoanRequest } from 'types/LoanRequests';
import { NumberInput } from '@/components/number-input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  dni: z.string().min(13, {
    message: 'El DNI debe tener 13 caracteres.'
  }),
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
  monthlyIncome: z.number().optional(),
  dealershipId: z.string().min(1, {
    message: 'Debe seleccionar una concesionaria.'
  }),
  dealershipAdminId: z.string().min(1, {
    message: 'Debe seleccionar un administrador de concesionaria.'
  }),
  city: z.string().optional(),
  comment: z.string().optional()
});

type FormValues = z.input<typeof formSchema>;

type LoanRequestFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function LoanRequestForm({
  open,
  onOpenChange
}: LoanRequestFormProps) {
  const apiClient = useAxios();
  const createLoanRequestMutation = useCreateLoanRequest(apiClient);
  const [dealershipOpen, setDealershipOpen] = React.useState(false);
  const [adminOpen, setAdminOpen] = React.useState(false);

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dni: '',
      vehicleTypeId: '',
      requestedAmount: 0,
      vehicleBrand: '',
      vehicleModel: '',
      vehicleYear: new Date().getFullYear(),
      monthlyIncome: 0,
      dealershipId: '',
      dealershipAdminId: '',
      city: '',
      comment: ''
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
      const result = formSchema.safeParse(values);

      if (!result.success) {
        return;
      }

      const transformedValues: CreateLoanRequest = {
        dni: result.data.dni,
        vehicleTypeId: result.data.vehicleTypeId,
        requestedAmount: result.data.requestedAmount,
        vehicleBrand: result.data.vehicleBrand,
        vehicleModel: result.data.vehicleModel,
        vehicleYear: result.data.vehicleYear,
        monthlyIncome:
          result.data.monthlyIncome === 0 ||
          result.data.monthlyIncome === undefined
            ? null
            : result.data.monthlyIncome,
        dealershipAdminId: result.data.dealershipAdminId,
        city: result.data.city || '',
        comment: result.data.comment || ''
      };

      createLoanRequestMutation.mutate(transformedValues, {
        onSuccess: () => {
          resetForm();
          onOpenChange(false);
          toast.success('Solicitud creada', {
            description: 'La solicitud ha sido creada correctamente.'
          });
        },
        onError: (error) => {
          toast.error('Error al crear la solicitud', {
            description: error.message
          });
        }
      });
    },
    [createLoanRequestMutation, resetForm, onOpenChange]
  );

  const isFormLocked = createLoanRequestMutation.isPending;

  const handleClose = useCallback(() => {
    if (isFormLocked) return;
    resetForm();
    createLoanRequestMutation.reset();
    onOpenChange(false);
  }, [resetForm, onOpenChange, createLoanRequestMutation, isFormLocked]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const isLoading =
    isVehicleTypesLoading ||
    isVehicleTypesFetching ||
    !isVehicleTypesSuccess ||
    isDealershipsLoading ||
    isDealershipsFetching ||
    !isDealershipsSuccess ||
    isUsersLoading ||
    isUsersFetching ||
    !isUsersSuccess;

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpenState) => {
        if (!newOpenState && isFormLocked) return;
        onOpenChange(newOpenState);
      }}
    >
      <DialogContent
        className='sm:max-w-[725px]'
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
        <DialogHeader>
          <DialogTitle className='text-lg md:text-xl'>
            Nueva Solicitud de Préstamo
          </DialogTitle>
          <DialogDescription className='text-sm md:text-base'>
            Complete los datos de la nueva solicitud en el formulario a
            continuación.
          </DialogDescription>
        </DialogHeader>

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
                    name='dni'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DNI del Cliente</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='Ingrese el DNI del cliente'
                            autoFocus
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='vehicleBrand'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
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
                        <FormLabel>Modelo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder='Ingrese el modelo' />
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
                        <FormLabel>Año</FormLabel>
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
                    name='dealershipId'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Concesionaria</FormLabel>
                        <Popover
                          open={dealershipOpen}
                          onOpenChange={setDealershipOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant='outline'
                                role='combobox'
                                aria-expanded={dealershipOpen}
                                className={cn(
                                  'w-full justify-between',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value
                                  ? dealerships.find(
                                      (dealership) =>
                                        dealership.id === field.value
                                    )?.name
                                  : 'Seleccione una concesionaria'}
                                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-full p-0'>
                            <Command>
                              <CommandInput
                                placeholder='Buscar concesionaria...'
                                className='h-9'
                              />
                              <CommandList>
                                <CommandEmpty>
                                  No se encontraron concesionarias.
                                </CommandEmpty>
                                <CommandGroup>
                                  {dealerships.map((dealership) => (
                                    <CommandItem
                                      key={dealership.id}
                                      value={dealership.name}
                                      onSelect={() => {
                                        form.setValue(
                                          'dealershipId',
                                          dealership.id
                                        );
                                        setDealershipOpen(false);
                                      }}
                                    >
                                      {dealership.name}
                                      <Check
                                        className={cn(
                                          'ml-auto h-4 w-4',
                                          field.value === dealership.id
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='dealershipAdminId'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Asesor de Concesionaria</FormLabel>
                        <Popover open={adminOpen} onOpenChange={setAdminOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant='outline'
                                role='combobox'
                                aria-expanded={adminOpen}
                                className={cn(
                                  'w-full justify-between',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value
                                  ? dealershipAdmins.find(
                                      (admin) => admin.id === field.value
                                    )?.name
                                  : 'Seleccione un administrador'}
                                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-full p-0'>
                            <Command>
                              <CommandInput
                                placeholder='Buscar administrador...'
                                className='h-9'
                              />
                              <CommandList>
                                <CommandEmpty>
                                  No se encontraron administradores.
                                </CommandEmpty>
                                <CommandGroup>
                                  {dealershipAdmins.map((admin) => (
                                    <CommandItem
                                      key={admin.id}
                                      value={admin.name}
                                      onSelect={() => {
                                        form.setValue(
                                          'dealershipAdminId',
                                          admin.id
                                        );
                                        setAdminOpen(false);
                                      }}
                                    >
                                      {admin.name}
                                      <Check
                                        className={cn(
                                          'ml-auto h-4 w-4',
                                          field.value === admin.id
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
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
                        <Input {...field} placeholder='Ingrese la ciudad' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='comment'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comentario</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder='Ingrese un comentario' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {createLoanRequestMutation.error && (
                <Alert variant='destructive'>
                  <AlertDescription>
                    {String(createLoanRequestMutation.error)}
                  </AlertDescription>
                </Alert>
              )}

              <div className='flex justify-end gap-4'>
                <Button
                  variant='outline'
                  type='button'
                  disabled={isFormLocked}
                  onClick={handleClose}
                >
                  Cancelar
                </Button>
                <Button type='submit' disabled={isFormLocked}>
                  {isFormLocked ? (
                    <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <SaveIcon className='mr-2 h-4 w-4' />
                  )}
                  {isFormLocked ? 'Guardando...' : 'Crear Solicitud'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
