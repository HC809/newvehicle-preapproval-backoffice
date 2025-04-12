'use client';

import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AlertCircle, SaveIcon, Search, MapPin, Home } from 'lucide-react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAxios from '@/hooks/use-axios';
import { toast } from 'sonner';
import { useBranches, Branch } from '@/features/branches/api/branch-service';
import { useUsers, UserQueryParams } from '@/features/users/api/user-service';
import {
  useAssignVisit,
  useLoanRequestDetail
} from '../api/loan-request-service';
import { UserRole } from 'types/User';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

// Schema for form validation
const formSchema = z.object({
  branchCode: z
    .string()
    .min(1, { message: 'Por favor seleccione una agencia.' }),
  branchManagerId: z
    .string()
    .min(1, { message: 'Por favor seleccione un gerente de agencia.' }),
  pymeAdvisorId: z
    .string()
    .min(1, { message: 'Por favor seleccione un asesor PYME.' })
});

type FormValues = z.infer<typeof formSchema>;

type AssignVisitFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanRequestId: string;
  onSuccess: () => void;
};

export default function AssignVisitForm({
  open,
  onOpenChange,
  loanRequestId,
  onSuccess
}: AssignVisitFormProps) {
  const apiClient = useAxios();
  const assignVisitMutation = useAssignVisit(apiClient!);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // State for tracking the selected branch
  const [selectedBranchCode, setSelectedBranchCode] = useState<number | null>(
    null
  );
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // State for search filters
  const [branchSearchQuery, setBranchSearchQuery] = useState('');

  // Fetch loan request details to get client information
  const { data: loanRequestDetail, isLoading: isLoadingLoanRequest } =
    useLoanRequestDetail(apiClient!, loanRequestId, open);

  // Fetch branches
  const { data: branches = [], isLoading: isBranchesLoading } = useBranches(
    apiClient!,
    open
  );

  // Create query params for users (only filter by branchCode)
  const userQueryParams: UserQueryParams = useMemo(
    () => ({
      branchCode: selectedBranchCode || undefined
    }),
    [selectedBranchCode]
  );

  // Fetch all users for the selected branch
  const { data: branchUsers = [], isLoading: isUsersLoading } = useUsers(
    apiClient!,
    open && !!selectedBranchCode,
    userQueryParams
  );

  // Filter branches based on search query
  const filteredBranches = useMemo(() => {
    if (!branchSearchQuery.trim()) return branches;

    return branches.filter(
      (branch) =>
        branch.nombre.toLowerCase().includes(branchSearchQuery.toLowerCase()) ||
        branch.codSuc.toString().includes(branchSearchQuery)
    );
  }, [branches, branchSearchQuery]);

  // Filter branch managers and PYME advisors from fetched users
  const branchManagers = useMemo(
    () =>
      branchUsers.filter(
        (user) =>
          user.role === UserRole.BranchManager &&
          user.isActive &&
          !user.isDeleted
      ),
    [branchUsers]
  );

  const pymeAdvisors = useMemo(
    () =>
      branchUsers.filter(
        (user) =>
          user.role === UserRole.PYMEAdvisor && user.isActive && !user.isDeleted
      ),
    [branchUsers]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branchCode: '',
      branchManagerId: '',
      pymeAdvisorId: ''
    },
    mode: 'onChange'
  });

  // Handle branch selection change
  const handleBranchChange = useCallback(
    (value: string) => {
      // Update form value
      form.setValue('branchCode', value);

      // Reset dependent fields
      form.setValue('branchManagerId', '');
      form.setValue('pymeAdvisorId', '');

      // Update selectedBranchCode and selectedBranch states
      const branchCode = value ? parseInt(value, 10) : null;
      setSelectedBranchCode(branchCode);

      if (branchCode) {
        const branch = branches.find((b) => b.codSuc === branchCode) || null;
        setSelectedBranch(branch);
      } else {
        setSelectedBranch(null);
      }

      // Reset search query
      setBranchSearchQuery('');
    },
    [form, branches]
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBranchSearchQuery(e.target.value);
      // Re-focus the input after state update
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 0);
    },
    []
  );

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedBranchCode(null);
      setSelectedBranch(null);
      setBranchSearchQuery('');
    }
  }, [open, form]);

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      if (!loanRequestId || !selectedBranch) return;

      assignVisitMutation.mutate(
        {
          loanRequestId,
          branchCode: parseInt(values.branchCode, 10),
          branchName: selectedBranch.nombre || '',
          branchAddress: selectedBranch.direccion || '',
          branchManagerId: values.branchManagerId,
          pymeAdvisorId: values.pymeAdvisorId
        },
        {
          onSuccess: () => {
            toast.success('Visita asignada exitosamente', {
              description: 'La visita ha sido asignada correctamente.'
            });
            onOpenChange(false);
            onSuccess();
          },
          onError: (error) => {
            toast.error('Error al asignar la visita', {
              description: String(error)
            });
          }
        }
      );
    },
    [
      assignVisitMutation,
      loanRequestId,
      selectedBranch,
      onOpenChange,
      onSuccess
    ]
  );

  const isFormLocked = assignVisitMutation.isPending;
  const loadingUsers =
    isBranchesLoading || (!!selectedBranchCode && isUsersLoading);
  const isFormValid = form.formState.isValid;

  // Get client data for display
  const clientCity = loanRequestDetail?.loanRequest?.city || 'No disponible';
  const clientAddress =
    loanRequestDetail?.client?.residentialAddress || 'No disponible';

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpenState) => {
        if (!newOpenState && isFormLocked) return; // Prevent closing if mutation is pending
        onOpenChange(newOpenState);
      }}
    >
      <DialogContent
        className='sm:max-w-[550px]'
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
            Asignar Visita
          </DialogTitle>
          <DialogDescription className='text-sm md:text-base'>
            Seleccione la agencia y los responsables para la visita.
          </DialogDescription>
        </DialogHeader>

        {isLoadingLoanRequest ? (
          <div className='flex justify-center py-4'>
            <ReloadIcon className='h-6 w-6 animate-spin text-primary' />
          </div>
        ) : (
          <>
            <Card className='bg-muted/30'>
              <CardContent className='pt-4'>
                <div className='space-y-2'>
                  <div className='flex items-start'>
                    <MapPin className='mr-2 mt-0.5 h-4 w-4 text-primary' />
                    <div>
                      <p className='text-sm font-medium'>Ciudad del Cliente</p>
                      <p className='text-sm text-muted-foreground'>
                        {clientCity}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start'>
                    <Home className='mr-2 mt-0.5 h-4 w-4 text-primary' />
                    <div>
                      <p className='text-sm font-medium'>
                        Dirección Residencial
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {clientAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className='space-y-4 md:space-y-6'
              >
                <div className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='branchCode'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agencia / Sucursal</FormLabel>
                        <Select
                          onValueChange={handleBranchChange}
                          value={field.value}
                          disabled={isBranchesLoading || isFormLocked}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Seleccione una agencia' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent
                            onCloseAutoFocus={(e) => {
                              // Prevent focus being returned to the trigger on close
                              if (
                                document.activeElement ===
                                searchInputRef.current
                              ) {
                                e.preventDefault();
                              }
                            }}
                          >
                            <div className='flex items-center px-3 pb-2'>
                              <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
                              <Input
                                ref={searchInputRef}
                                placeholder='Buscar agencia...'
                                className='h-9 border-none bg-transparent focus-visible:ring-transparent'
                                value={branchSearchQuery}
                                onChange={handleSearchChange}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  // Prevent select from closing on Enter
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </div>
                            <ScrollArea className='max-h-[200px]'>
                              {filteredBranches.length > 0 ? (
                                filteredBranches.map((branch) => (
                                  <SelectItem
                                    key={branch.codSuc}
                                    value={branch.codSuc.toString()}
                                  >
                                    {branch.nombre}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className='px-2 py-4 text-center text-sm text-muted-foreground'>
                                  No se encontraron agencias
                                </div>
                              )}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedBranch && (
                    <div className='rounded-md bg-muted/50 p-3 text-sm'>
                      <div className='mb-2 flex items-start'>
                        <MapPin className='mr-2 mt-0.5 h-4 w-4 text-primary/70' />
                        <div>
                          <p className='font-medium'>
                            Dirección de la agencia:
                          </p>
                          <p className='text-muted-foreground'>
                            {selectedBranch.direccion || 'No disponible'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedBranchCode && (
                    <>
                      <FormField
                        control={form.control}
                        name='branchManagerId'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gerente de Agencia</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isUsersLoading || isFormLocked}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Seleccione un gerente de agencia' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {branchManagers.length > 0 ? (
                                  branchManagers.map((manager) => (
                                    <SelectItem
                                      key={manager.id}
                                      value={manager.id}
                                    >
                                      {manager.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value='no-managers' disabled>
                                    No hay gerentes disponibles para esta
                                    agencia
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='pymeAdvisorId'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Asesor PYME</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isUsersLoading || isFormLocked}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Seleccione un asesor PYME' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {pymeAdvisors.length > 0 ? (
                                  pymeAdvisors.map((advisor) => (
                                    <SelectItem
                                      key={advisor.id}
                                      value={advisor.id}
                                    >
                                      {advisor.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value='no-advisors' disabled>
                                    No hay asesores disponibles para esta
                                    agencia
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                {assignVisitMutation.error && (
                  <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>
                      {String(assignVisitMutation.error)}
                    </AlertDescription>
                  </Alert>
                )}

                {branchManagers.length === 0 &&
                  selectedBranchCode &&
                  !isUsersLoading && (
                    <div className='rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/50'>
                      <div className='flex'>
                        <AlertCircle className='h-5 w-5 text-yellow-600 dark:text-yellow-500' />
                        <div className='ml-3'>
                          <p className='text-sm text-yellow-700 dark:text-yellow-400'>
                            No hay gerentes de agencia disponibles para la
                            sucursal seleccionada.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {pymeAdvisors.length === 0 &&
                  selectedBranchCode &&
                  !isUsersLoading && (
                    <div className='rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/50'>
                      <div className='flex'>
                        <AlertCircle className='h-5 w-5 text-yellow-600 dark:text-yellow-500' />
                        <div className='ml-3'>
                          <p className='text-sm text-yellow-700 dark:text-yellow-400'>
                            No hay asesores PYME disponibles para la sucursal
                            seleccionada.
                          </p>
                        </div>
                      </div>
                    </div>
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
                    disabled={isFormLocked || !isFormValid || loadingUsers}
                    className={cn(
                      !isFormValid && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {isFormLocked ? (
                      <>
                        <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
                        Asignando...
                      </>
                    ) : (
                      <>
                        <SaveIcon className='mr-2 h-4 w-4' />
                        Asignar Visita
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
