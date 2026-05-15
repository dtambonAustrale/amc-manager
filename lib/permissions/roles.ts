import type { UserRole } from '@/types/database'

export const PERMISSIONS = {
  // Clients
  CLIENTS_READ: 'clients:read',
  CLIENTS_WRITE: 'clients:write',
  CLIENTS_DELETE: 'clients:delete',
  CLIENTS_ARCHIVE: 'clients:archive',

  // Cases
  CASES_READ: 'cases:read',
  CASES_WRITE: 'cases:write',
  CASES_DELETE: 'cases:delete',
  CASES_CLOSE: 'cases:close',

  // Payments
  PAYMENTS_READ: 'payments:read',
  PAYMENTS_WRITE: 'payments:write',
  PAYMENTS_DELETE: 'payments:delete',

  // Appointments
  APPOINTMENTS_READ: 'appointments:read',
  APPOINTMENTS_WRITE: 'appointments:write',
  APPOINTMENTS_DELETE: 'appointments:delete',

  // Reports
  REPORTS_READ: 'reports:read',
  REPORTS_WRITE: 'reports:write',
  REPORTS_DELETE: 'reports:delete',
  REPORTS_VALIDATE: 'reports:validate',

  // Admin
  USERS_MANAGE: 'users:manage',
  SETTINGS_MANAGE: 'settings:manage',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: Object.values(PERMISSIONS) as Permission[],

  collaborator: [
    PERMISSIONS.CLIENTS_READ,
    PERMISSIONS.CLIENTS_WRITE,
    PERMISSIONS.CASES_READ,
    PERMISSIONS.CASES_WRITE,
    PERMISSIONS.PAYMENTS_READ,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.APPOINTMENTS_WRITE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_WRITE,
  ],

  lawyer: [
    PERMISSIONS.CLIENTS_READ,
    PERMISSIONS.CASES_READ,
    PERMISSIONS.APPOINTMENTS_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_WRITE,
    PERMISSIONS.REPORTS_VALIDATE,
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  collaborator: 'Collaborateur',
  lawyer: 'Avocat',
}
