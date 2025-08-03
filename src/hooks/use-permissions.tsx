'use client';

import { useSession } from 'next-auth/react';
import { hasRoleAccess } from '@/lib/routes';

export function usePermissions() {
  const { data: session } = useSession();

  const userRole = session?.role;

  // Determinar si es admin basado en permisos específicos
  const isAdmin = userRole
    ? hasRoleAccess(userRole, '/dashboard/users') ||
      hasRoleAccess(userRole, '/dashboard/dealerships') ||
      hasRoleAccess(userRole, '/dashboard/company-configurations') ||
      hasRoleAccess(userRole, '/dashboard/vehicle-types')
    : false;

  const canAccess = (pathname: string): boolean => {
    if (!userRole) return false;
    return hasRoleAccess(userRole, pathname);
  };

  const canManageUsers = (): boolean => {
    return canAccess('/dashboard/users');
  };

  const canManageDealerships = (): boolean => {
    return canAccess('/dashboard/dealerships');
  };

  const canManageCompanyConfig = (): boolean => {
    return canAccess('/dashboard/company-configurations');
  };

  const canManageVehicleTypes = (): boolean => {
    return canAccess('/dashboard/vehicle-types');
  };

  const canViewLoanRequests = (): boolean => {
    return canAccess('/dashboard/loan-requests');
  };

  const canViewClients = (): boolean => {
    return canAccess('/dashboard/clients');
  };

  const canViewDiagnostics = (): boolean => {
    return canAccess('/dashboard/diagnostics');
  };

  return {
    userRole,
    isAdmin,
    canAccess,
    canManageUsers,
    canManageDealerships,
    canManageCompanyConfig,
    canManageVehicleTypes,
    canViewLoanRequests,
    canViewClients,
    canViewDiagnostics
  };
}
