'use client';

import { useEffect, useCallback } from 'react';
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
import { SaveIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  UpdateLoanRequestForm,
  DownPaymentType,
  LoanRequestDetail
} from 'types/LoanRequests';
import { useUpdateLoanRequest } from '../api/loan-request-service';
import { useVehicleTypes } from '@/features/vehicle-types/api/vehicle-type-service';
import useAxios from '@/hooks/use-axios';
import { toast } from 'sonner';
import { NumberInput } from '@/components/number-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

// Schema for form validation
const formSchema = z.object({
  id: z.string(),
  vehicleBrand: z
    .string()
    .min(2, { message: 'La marca debe tener al menos 2 caracteres.' }),
  vehicleModel: z
    .string()
    .min(2, { message: 'El modelo debe tener al menos 2 caracteres.' }),
  vehicleYear: z
    .number()
    .min(new Date().getFullYear() - 5, {
      message: `El año del vehículo debe ser desde ${new Date().getFullYear() - 5}.`
    })
    .max(new Date().getFullYear() + 2, {
      message: `El año del vehículo no puede ser mayor a ${new Date().getFullYear() + 2}.`
    }),
  vehicleTypeId: z
    .string()
    .min(1, { message: 'Por favor seleccione un tipo de vehículo.' }),
  requestedAmount: z
    .number()
    .min(1, { message: 'El monto solicitado debe ser mayor a 0.' }),
  interestRate: z
    .number()
    .min(0, { message: 'La tasa de interés no puede ser negativa.' })
    .max(100, { message: 'La tasa de interés no puede ser mayor a 100%.' }),
  approvedLoanTermMonths: z
    .number()
    .min(1, { message: 'El plazo aprobado debe ser al menos 1 mes.' })
    .max(240, { message: 'El plazo máximo es de 240 meses (20 años).' }),
  downPaymentType: z.nativeEnum(DownPaymentType),
  approvedDownPaymentPercentage: z
    .number()
    .min(0, { message: 'El porcentaje de prima no puede ser negativo.' })
    .max(100, { message: 'El porcentaje de prima no puede ser mayor a 100%.' })
    .nullable(),
  requestedDownPaymentAmount: z
    .number()
    .min(0, { message: 'El monto de prima no puede ser negativo.' })
    .nullable(),
  vehicleInsuranceRate: z
    .number()
    .min(0, { message: 'La tasa de seguro no puede ser negativa.' })
    .max(100, { message: 'La tasa de seguro no puede ser mayor a 100%.' }),
  monthlyIncome: z
    .number()
    .min(0, { message: 'El ingreso mensual no puede ser negativo.' })
    .nullable()
    .transform((val) => (val === 0 ? null : val))
}) satisfies z.ZodType<UpdateLoanRequestForm>;

type FormValues = z.infer<typeof formSchema>;

type LoanRequestEditFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanRequest: LoanRequestDetail;
  onSuccess: () => void;
};

export default function LoanRequestEditForm({
  open,
  onOpenChange,
  loanRequest,
  onSuccess
}: LoanRequestEditFormProps) {
  const apiClient = useAxios();
  const updateLoanRequestMutation = useUpdateLoanRequest(apiClient!);

  // Fetch vehicle types
  const { data: vehicleTypes = [], isLoading: isVehicleTypesLoading } =
    useVehicleTypes(apiClient!, open);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      vehicleBrand: '',
      vehicleModel: '',
      vehicleYear: new Date().getFullYear(),
      vehicleTypeId: '',
      requestedAmount: 0,
      interestRate: 0,
      approvedLoanTermMonths: 1,
      downPaymentType: DownPaymentType.Percentage,
      approvedDownPaymentPercentage: 0,
      requestedDownPaymentAmount: null,
      vehicleInsuranceRate: 0,
      monthlyIncome: 0
    },
    mode: 'onChange'
  });

  // Initialize form with loan request data
  useEffect(() => {
    if (open && loanRequest) {
      const downPaymentPercentage =
        loanRequest.loanCalculation?.downPaymentPercentage ?? 0;
      const downPaymentValue =
        loanRequest.loanCalculation?.downPaymentValue ?? 0;
      const downPaymentType = loanRequest.loanCalculation?.downPaymentType;

      form.reset({
        id: loanRequest.loanRequest.id,
        vehicleBrand: loanRequest.loanRequest.vehicleBrand || '',
        vehicleModel: loanRequest.loanRequest.vehicleModel || '',
        vehicleYear:
          loanRequest.loanRequest.vehicleYear || new Date().getFullYear(),
        vehicleTypeId: loanRequest.loanRequest.vehicleTypeId || '',
        requestedAmount: loanRequest.loanRequest.requestedAmount || 0,
        interestRate: loanRequest.loanRequest.appliedInterestRate || 0,
        approvedLoanTermMonths:
          loanRequest.loanRequest.approvedLoanTermMonths ||
          loanRequest.loanRequest.requestedLoanTermMonths ||
          1,
        downPaymentType: downPaymentType || DownPaymentType.Percentage,
        approvedDownPaymentPercentage:
          downPaymentType === DownPaymentType.Percentage
            ? downPaymentPercentage
            : null,
        requestedDownPaymentAmount:
          downPaymentType === DownPaymentType.Amount ? downPaymentValue : null,
        vehicleInsuranceRate: loanRequest.loanRequest.vehicleInsuranceRate || 0,
        monthlyIncome: loanRequest.loanRequest.monthlyIncome || 0
      });
    }
  }, [open, loanRequest, form]);

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      const submitData: UpdateLoanRequestForm = {
        ...values,
        id: values.id, // Asegurarnos de que el ID se incluye explícitamente
        monthlyIncome: values.monthlyIncome === 0 ? null : values.monthlyIncome,
        approvedDownPaymentPercentage:
          values.downPaymentType === DownPaymentType.Percentage
            ? values.approvedDownPaymentPercentage
            : null,
        requestedDownPaymentAmount:
          values.downPaymentType === DownPaymentType.Amount
            ? values.requestedDownPaymentAmount
            : null
      };

      // Asegurarnos que el porcentaje de pago inicial sea válido cuando se selecciona porcentaje
      if (
        submitData.downPaymentType === DownPaymentType.Percentage &&
        (submitData.approvedDownPaymentPercentage === null ||
          submitData.approvedDownPaymentPercentage === undefined)
      ) {
        toast.error('Error al actualizar la solicitud', {
          description: 'El porcentaje de pago inicial es requerido'
        });
        return;
      }

      // Asegurarnos que el monto de pago inicial sea válido cuando se selecciona monto
      if (
        submitData.downPaymentType === DownPaymentType.Amount &&
        (submitData.requestedDownPaymentAmount === null ||
          submitData.requestedDownPaymentAmount === undefined)
      ) {
        toast.error('Error al actualizar la solicitud', {
          description: 'El monto de pago inicial es requerido'
        });
        return;
      }

      updateLoanRequestMutation.mutate(
        {
          loanRequestId: values.id,
          ...submitData
        },
        {
          onSuccess: () => {
            toast.success('Solicitud actualizada', {
              description: 'La solicitud ha sido actualizada correctamente.'
            });
            onOpenChange(false);
            setTimeout(() => {
              onSuccess();
            }, 100);
          },
          onError: (error) => {
            toast.error('Error al actualizar la solicitud', {
              description: String(error)
            });
          }
        }
      );
    },
    [updateLoanRequestMutation, onOpenChange, onSuccess]
  );

  const isFormLocked = updateLoanRequestMutation.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpenState) => {
        if (!newOpenState && isFormLocked) return; // Prevent closing if mutations are pending
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
            Editar Solicitud de Préstamo
          </DialogTitle>
          <DialogDescription className='text-sm md:text-base'>
            Modifique los detalles de la solicitud de préstamo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4 md:space-y-6'
          >
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
              {/* Primera columna */}
              <div className='space-y-4 md:space-y-6'>
                <FormField
                  control={form.control}
                  name='vehicleBrand'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca del Vehículo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Ingrese la marca del vehículo'
                          autoFocus
                        />
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
                        <Input
                          {...field}
                          placeholder='Ingrese el modelo del vehículo'
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
                        <NumberInput
                          placeholder='Ingrese el año del vehículo'
                          min={new Date().getFullYear() - 5}
                          max={new Date().getFullYear() + 2}
                          value={field.value}
                          onValueChange={(value: number | undefined) => {
                            field.onChange(
                              value === undefined
                                ? new Date().getFullYear()
                                : value
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
                        disabled={isVehicleTypesLoading}
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
                      <FormLabel>Monto Solicitado</FormLabel>
                      <FormControl>
                        <NumberInput
                          placeholder='Ingrese el monto solicitado'
                          min={1}
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

              {/* Segunda columna */}
              <div className='space-y-4 md:space-y-6'>
                <FormField
                  control={form.control}
                  name='interestRate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasa de Interés (%)</FormLabel>
                      <FormControl>
                        <NumberInput
                          placeholder='Ingrese la tasa de interés'
                          min={0}
                          max={100}
                          step={0.1}
                          decimalScale={2}
                          fixedDecimalScale={true}
                          suffix='%'
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
                  name='approvedLoanTermMonths'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plazo Aprobado (meses)</FormLabel>
                      <FormControl>
                        <NumberInput
                          placeholder='Ingrese el plazo aprobado en meses'
                          min={1}
                          max={240}
                          value={field.value}
                          onValueChange={(value: number | undefined) => {
                            field.onChange(value === undefined ? 1 : value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='downPaymentType'
                  render={({ field }) => (
                    <FormItem className='h-[76px]'>
                      <FormLabel className='flex items-center gap-2'>
                        Tipo de Prima
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <InfoIcon className='h-4 w-4 text-muted-foreground' />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Seleccione si desea ingresar la prima como
                                porcentaje o monto fijo
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className='flex h-12 items-center space-x-4'
                        >
                          <FormItem className='flex h-[68px] items-center space-x-2 space-y-0'>
                            <FormControl>
                              <RadioGroupItem
                                value={DownPaymentType.Percentage}
                              />
                            </FormControl>
                            <FormLabel className='cursor-pointer font-normal'>
                              Porcentaje
                            </FormLabel>
                          </FormItem>
                          <FormItem className='flex items-center space-x-2 space-y-0'>
                            <FormControl>
                              <RadioGroupItem value={DownPaymentType.Amount} />
                            </FormControl>
                            <FormLabel className='cursor-pointer font-normal'>
                              Monto
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('downPaymentType') ===
                DownPaymentType.Percentage ? (
                  <FormField
                    control={form.control}
                    name='approvedDownPaymentPercentage'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          Porcentaje de Prima
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className='h-4 w-4 text-muted-foreground' />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Ingrese el porcentaje de prima entre 0% y 100%
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <NumberInput
                            placeholder='Ingrese el porcentaje de prima'
                            min={0}
                            max={100}
                            step={0.1}
                            decimalScale={2}
                            fixedDecimalScale={true}
                            suffix='%'
                            value={
                              loanRequest.loanCalculation
                                ?.downPaymentPercentage ?? 0
                            }
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
                ) : (
                  <FormField
                    control={form.control}
                    name='requestedDownPaymentAmount'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          Monto de Prima
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className='h-4 w-4 text-muted-foreground' />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Ingrese el monto de prima (no puede ser mayor
                                  al valor total del vehículo)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <FormControl>
                          <NumberInput
                            placeholder='Ingrese el monto de prima'
                            min={0}
                            max={form.watch('requestedAmount')}
                            thousandSeparator=','
                            prefix='L '
                            value={
                              loanRequest.loanCalculation?.downPaymentValue ?? 0
                            }
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
                )}

                <FormField
                  control={form.control}
                  name='vehicleInsuranceRate'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasa de Seguro (%)</FormLabel>
                      <FormControl>
                        <NumberInput
                          placeholder='Ingrese la tasa de seguro'
                          min={0}
                          max={100}
                          step={0.1}
                          decimalScale={2}
                          fixedDecimalScale={true}
                          suffix='%'
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
                  name='monthlyIncome'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ingreso Mensual</FormLabel>
                      <FormControl>
                        <NumberInput
                          placeholder='Ingrese el ingreso mensual'
                          min={0}
                          thousandSeparator=','
                          prefix='L '
                          value={field.value ?? undefined}
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
            </div>

            {updateLoanRequestMutation.error && (
              <Alert variant='destructive'>
                <AlertDescription>
                  {String(updateLoanRequestMutation.error)}
                </AlertDescription>
              </Alert>
            )}

            <div className='flex justify-end space-x-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isFormLocked}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={isFormLocked || !form.formState.isValid}
              >
                {isFormLocked ? (
                  <>
                    <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                    Guardando...
                  </>
                ) : (
                  <>
                    <SaveIcon className='mr-2 h-4 w-4' />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
