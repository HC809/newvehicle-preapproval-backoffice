'use client';

import { useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { useSession } from 'next-auth/react';
import { Options } from 'nuqs';
import useAxios from '@/hooks/use-axios';
import { useUsers } from '@/features/users/api/user-service';
import { useDealerships } from '@/features/dealerships/api/dealership-service';
import { UserRole } from 'types/User';
import { LoanRequestStatus } from 'types/LoanRequests';
import { Badge } from '@/components/ui/badge';
import { translateStatus, getStatusVariant } from '@/utils/getStatusColor';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { FilterIcon } from 'lucide-react';

export function useLoanRequestTableFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('dni') || '');
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

  const setSearchQueryValue = useCallback(
    (
      value: string | ((old: string) => string | null) | null,
      options?: Options
    ) => {
      let newValue: string | null = null;
      if (typeof value === 'function') {
        newValue = value(searchQuery);
      } else {
        newValue = value;
      }
      setSearchQuery(newValue || '');
      const queryString = createQueryString('dni', newValue);
      router.push(`${pathname}?${queryString}`);
      return Promise.resolve(new URLSearchParams(queryString));
    },
    [searchQuery, createQueryString, pathname, router]
  );

  const setPageValue = useCallback(
    (
      value: number | ((old: number) => number | null) | null,
      options?: Options
    ) => {
      let newValue: number | null = null;
      if (typeof value === 'function') {
        newValue = value(page);
      } else {
        newValue = value;
      }
      if (newValue !== null) {
        setPage(newValue);
        const queryString = createQueryString('page', newValue.toString());
        router.push(`${pathname}?${queryString}`);
        return Promise.resolve(new URLSearchParams(queryString));
      }
      return Promise.resolve(new URLSearchParams());
    },
    [page, createQueryString, pathname, router]
  );

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
    setSearchQuery('');
    setDealershipFilter('');
    setManagerFilter('');
    setStatusFilter('');
    router.push(pathname);
  }, [pathname, router]);

  const isAnyFilterActive =
    searchQuery !== '' ||
    dealershipFilter !== '' ||
    managerFilter !== '' ||
    statusFilter !== '';

  return {
    page,
    setPageValue,
    searchQuery,
    setSearchQueryValue,
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

export default function LoanRequestTableAction() {
  const { data: session } = useSession();
  const isAdmin = !!session?.isSystemAdmin;
  const apiClient = useAxios();

  // Obtener usuarios con rol BusinessDevelopment_User y que estén activos
  const { data: users = [] } = useUsers(apiClient);
  const activeManagers = users.filter(
    (user) => user.role === UserRole.BusinessDevelopment_User && user.isActive
  );

  // Obtener concesionarias
  const { data: dealerships = [] } = useDealerships(apiClient);

  const {
    searchQuery,
    dealershipFilter,
    managerFilter,
    statusFilter,
    setPageValue,
    setSearchQueryValue,
    setDealershipFilterValue,
    setManagerFilterValue,
    setStatusFilterValue,
    resetFilters,
    isAnyFilterActive
  } = useLoanRequestTableFilters();

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
      <DataTableSearch
        searchKey='DNI'
        searchQuery={searchQuery}
        setSearchQuery={setSearchQueryValue}
        setPage={setPageValue}
        translatedPlaceholder='Buscar por DNI...'
        translatedSelected='Seleccionado'
      />
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
          title='Responsables'
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

      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
        translatedReset='Restablecer filtros'
      />
    </div>
  );
}
