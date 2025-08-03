# Sistema de Permisos Basado en Roles

## Descripción General

Este sistema implementa un control de acceso granular basado en roles de usuario, reemplazando el sistema anterior que solo distinguía entre usuarios normales y administradores del sistema.

## Roles Disponibles

### IT_Admin
- **Acceso completo** a todas las funcionalidades
- Puede gestionar usuarios, concesionarias, configuraciones y tipos de vehículos
- Acceso a diagnósticos del sistema

### BusinessDevelopment_Admin
- **Gestión administrativa** sin acceso a diagnósticos
- Puede gestionar usuarios, concesionarias, configuraciones y tipos de vehículos
- No tiene acceso a diagnósticos del sistema

### BusinessDevelopment_User
- **Acceso operativo** limitado
- Solo puede ver solicitudes de préstamo y clientes

### Dealership_Admin
- **Gestión de concesionaria**
- Acceso a solicitudes de préstamo y clientes

### PYMEAdvisor
- **Asesoría PYME**
- Acceso a solicitudes de préstamo y clientes

### BranchManager
- **Gestión de sucursal**
- Acceso a solicitudes de préstamo y clientes

## Configuración de Rutas

Las rutas se configuran en `src/lib/routes.ts`:

```typescript
export const ROLE_ROUTES: Record<string, string[]> = {
  IT_Admin: [
    '/dashboard/users',
    '/dashboard/dealerships',
    '/dashboard/company-configurations',
    '/dashboard/vehicle-types',
    '/dashboard/diagnostics'
  ],
  // ... otros roles
};
```

## Middleware de Autorización

El middleware (`src/middleware.ts`) verifica automáticamente los permisos:

```typescript
// Verifica si el usuario tiene acceso a la ruta según su rol
if (isAuthenticated && userRole) {
  const hasAccess = hasRoleAccess(userRole, nextUrl.pathname);
  
  if (!hasAccess) {
    return NextResponse.redirect(new URL('/unauthorized', nextUrl));
  }
}
```

## Hook de Permisos

Usa el hook `usePermissions` para verificar permisos en componentes:

```typescript
import { usePermissions } from '@/hooks/use-permissions';

function MyComponent() {
  const { canManageUsers, canViewLoanRequests, userRole } = usePermissions();
  
  return (
    <div>
      {canManageUsers() && <UserManagementButton />}
      {canViewLoanRequests() && <LoanRequestsButton />}
    </div>
  );
}
```

## Componente de Navegación Filtrada

Usa `FilteredNav` para mostrar solo elementos de navegación permitidos:

```typescript
import { FilteredNav } from '@/components/layout/filtered-nav';

<FilteredNav items={navItems}>
  {(filteredItems) => (
    <nav>
      {filteredItems.map(item => (
        <NavItem key={item.url} {...item} />
      ))}
    </nav>
  )}
</FilteredNav>
```

## Configuración de Elementos de Navegación

Los elementos de navegación pueden especificar roles requeridos:

```typescript
{
  title: 'Configuración Financiera',
  url: '/dashboard/company-configurations',
  requiredRole: 'IT_Admin' // Solo IT_Admin puede acceder
}
```

## Funciones Helper

### `hasRoleAccess(userRole, pathname)`
Verifica si un rol tiene acceso a una ruta específica.

## Migración desde el Sistema Anterior

1. **Granular**: El nuevo sistema es más granular y específico por rol.
2. **Hook**: Usa `usePermissions` para todas las verificaciones de permisos.
3. **Rutas**: Las rutas se definen específicamente por rol en `ROLE_ROUTES`.

## Ejemplos de Uso

### Verificar Permisos en un Componente
```typescript
const { canManageUsers, userRole } = usePermissions();

if (!canManageUsers()) {
  return <UnauthorizedMessage />;
}
```

### Renderizado Condicional
```typescript
const { canViewDiagnostics } = usePermissions();

return (
  <div>
    <Dashboard />
    {canViewDiagnostics() && <DiagnosticsPanel />}
  </div>
);
```

### Navegación Dinámica
```typescript
<FilteredNav items={adminNavItems}>
  {(filteredItems) => (
    <Sidebar items={filteredItems} />
  )}
</FilteredNav>
``` 