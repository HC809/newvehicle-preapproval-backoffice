'use client';

import { useState, useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { Options } from 'nuqs';
import useAxios from '@/hooks/use-axios';
import { useUsers } from '@/features/users/api/user-service';
import { useDealerships } from '@/features/dealerships/api/dealership-service';
import { UserRole } from 'types/User';
import { LoanRequestStatus } from 'types/LoanRequests';
import { translateStatus, getStatusVariant } from '@/utils/getStatusColor';
import { Input } from '@/components/ui/input';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Dispatch, SetStateAction } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

export function useLoanRequestTableFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [page] = useState(1);
  const [dniFilter, setDniFilter] = useState(searchParams.get('dni') || '');
  const [dealershipFilter, setDealershipFilter] = useState(
    searchParams.get('dealership') || ''
  );
  const [managerFilter, setManagerFilter] = useState(
    searchParams.get('manager') || ''
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || ''
  );

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams]
  );

  const setDniFilterValue = useCallback(
    (
      value: string | ((old: string) => string | null) | null,
      options?: Options
    ) => {
      let newValue: string | null = null;
      if (typeof value === 'function') {
        newValue = value(dniFilter);
      } else {
        newValue = value;
      }
      setDniFilter(newValue || '');
      const queryString = createQueryString('dni', newValue);
      router.push(`${pathname}?${queryString}`);
      return Promise.resolve(new URLSearchParams(queryString));
    },
    [dniFilter, createQueryString, pathname, router]
  );

  // const setPageValue = useCallback(
  //   (
  //     value: number | ((old: number) => number | null) | null,
  //     options?: Options
  //   ) => {
  //     let newValue: number | null = null;
  //     if (typeof value === 'function') {
  //       newValue = value(page);
  //     } else {
  //       newValue = value;
  //     }
  //     if (newValue !== null) {
  //       setPage(newValue);
  //       const queryString = createQueryString('page', newValue.toString());
  //       router.push(`${pathname}?${queryString}`);
  //       return Promise.resolve(new URLSearchParams(queryString));
  //     }
  //     return Promise.resolve(new URLSearchParams());
  //   },
  //   [page, createQueryString, pathname, router]
  // );

  const setDealershipFilterValue = useCallback(
    (
      value: string | ((old: string) => string | null) | null,
      options?: Options
    ) => {
      let newValue: string | null = null;
      if (typeof value === 'function') {
        newValue = value(dealershipFilter);
      } else {
        newValue = value;
      }
      setDealershipFilter(newValue || '');
      const queryString = createQueryString('dealership', newValue);
      router.push(`${pathname}?${queryString}`);
      return Promise.resolve(new URLSearchParams(queryString));
    },
    [dealershipFilter, createQueryString, pathname, router]
  );

  const setManagerFilterValue = useCallback(
    (
      value: string | ((old: string) => string | null) | null,
      options?: Options
    ) => {
      let newValue: string | null = null;
      if (typeof value === 'function') {
        newValue = value(managerFilter);
      } else {
        newValue = value;
      }
      setManagerFilter(newValue || '');
      const queryString = createQueryString('manager', newValue);
      router.push(`${pathname}?${queryString}`);
      return Promise.resolve(new URLSearchParams(queryString));
    },
    [managerFilter, createQueryString, pathname, router]
  );

  const setStatusFilterValue = useCallback(
    (
      value: string | ((old: string) => string | null) | null,
      options?: Options
    ) => {
      let newValue: string | null = null;
      if (typeof value === 'function') {
        newValue = value(statusFilter);
      } else {
        newValue = value;
      }
      setStatusFilter(newValue || '');
      const queryString = createQueryString('status', newValue);
      router.push(`${pathname}?${queryString}`);
      return Promise.resolve(new URLSearchParams(queryString));
    },
    [statusFilter, createQueryString, pathname, router]
  );

  const resetFilters = useCallback(() => {
    setDniFilter('');
    setDealershipFilter('');
    setManagerFilter('');
    setStatusFilter('');
    router.push(pathname);
  }, [pathname, router]);

  const isAnyFilterActive = useMemo(() => {
    return (
      !!dniFilter || !!dealershipFilter || !!managerFilter || !!statusFilter
    );
  }, [dniFilter, dealershipFilter, managerFilter, statusFilter]);

  return {
    page,
    dniFilter,
    setDniFilterValue,
    dealershipFilter,
    setDealershipFilterValue,
    managerFilter,
    setManagerFilterValue,
    statusFilter,
    setStatusFilterValue,
    resetFilters,
    isAnyFilterActive
  };
}

interface LoanRequestTableActionProps {
  dniFilter?: string;
  setDniFilter?: Dispatch<SetStateAction<string>>;
  resetAllFilters?: () => void;
}

export default function LoanRequestTableAction({
  dniFilter: externalDniFilter,
  setDniFilter: externalSetDniFilter,
  resetAllFilters: externalResetFilters
}: LoanRequestTableActionProps = {}) {
  const { canManageUsers } = usePermissions();
  const isAdmin = canManageUsers();
  const apiClient = useAxios();

  // Obtener usuarios con rol BusinessDevelopment_User y que estén activos
  const { data: users = [] } = useUsers(apiClient);
  const activeManagers = users.filter(
    (user) => user.role === UserRole.BusinessDevelopment_User && user.isActive
  );

  // Obtener concesionarias
  const { data: dealerships = [] } = useDealerships(apiClient);

  const {
    dniFilter,
    setDniFilterValue,
    dealershipFilter,
    managerFilter,
    statusFilter,
    setDealershipFilterValue,
    setManagerFilterValue,
    setStatusFilterValue,
    resetFilters,
    isAnyFilterActive
  } = useLoanRequestTableFilters();

  // Consider external filters if provided
  const effectiveIsAnyFilterActive =
    (externalDniFilter !== undefined
      ? !!externalDniFilter
      : isAnyFilterActive) ||
    !!dealershipFilter ||
    !!managerFilter ||
    !!statusFilter;

  // Mapear concesionarias para el filtro
  const DEALERSHIP_OPTIONS = dealerships.map((dealership) => ({
    value: dealership.id,
    label: dealership.name
  }));

  // Mapear responsables para el filtro
  const MANAGER_OPTIONS = activeManagers.map((manager) => ({
    value: manager.name,
    label: manager.name
  }));

  // Estado para las opciones de status
  const STATUS_OPTIONS = Object.values(LoanRequestStatus).map((status) => ({
    value: status,
    label: translateStatus(status),
    variant: getStatusVariant(status),
    icon: ({ className }: { className?: string }) => (
      <div className='flex items-center'>
        <div
          className={`mr-2 h-3 w-3 rounded-sm ${
            getStatusVariant(status) === 'success'
              ? 'bg-green-500'
              : getStatusVariant(status) === 'destructive'
                ? 'bg-red-500'
                : getStatusVariant(status) === 'warning'
                  ? 'bg-yellow-500'
                  : getStatusVariant(status) === 'secondary'
                    ? 'bg-gray-500'
                    : 'bg-blue-500'
          }`}
        />
      </div>
    )
  }));

  return (
    <div className='flex flex-wrap items-center gap-4'>
      <div className='relative w-[300px]'>
        <MagnifyingGlassIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder='Buscar por DNI o nombre...'
          value={
            externalDniFilter !== undefined ? externalDniFilter : dniFilter
          }
          onChange={(e) => {
            if (externalSetDniFilter) {
              externalSetDniFilter(e.target.value);
            } else {
              setDniFilterValue(e.target.value);
            }
          }}
          className='pl-9'
        />
      </div>
      <DataTableFilterBox
        filterKey='dealerships'
        title='Concesionarias'
        options={DEALERSHIP_OPTIONS}
        setFilterValue={setDealershipFilterValue}
        filterValue={dealershipFilter}
        translatedSelected='Seleccionado'
        translatedClear='Limpiar filtros'
      />
      {isAdmin && (
        <DataTableFilterBox
          filterKey='managers'
          title='Gestores'
          options={MANAGER_OPTIONS}
          setFilterValue={setManagerFilterValue}
          filterValue={managerFilter}
          translatedSelected='Seleccionado'
          translatedClear='Limpiar filtros'
        />
      )}

      <DataTableFilterBox
        filterKey='status'
        title='Estado'
        options={STATUS_OPTIONS}
        setFilterValue={setStatusFilterValue}
        filterValue={statusFilter}
        translatedSelected='seleccionados'
        translatedClear='Limpiar filtros'
      />

      {effectiveIsAnyFilterActive && (
        <DataTableResetFilter
          isFilterActive={effectiveIsAnyFilterActive}
          onReset={externalResetFilters || resetFilters}
          translatedReset='Restablecer filtros'
        />
      )}
    </div>
  );
}
