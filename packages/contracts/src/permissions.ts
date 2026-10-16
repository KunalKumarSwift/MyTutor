import type { Role } from './enums.js';

export const PERMISSIONS = [
  'tutorials:manage',
  'categories:manage',
  'difficultyLevels:manage',
  'users:manage',
  'reports:view',
  'profile:manage',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

/**
 * Role → permission table derived from the legacy menus and page includes:
 * operators share every management screen with administrators except user management.
 * The server is the authority; clients only use this to decide what to display.
 */
export const ROLE_PERMISSIONS: Readonly<Record<Role, readonly Permission[]>> = {
  ADMIN: [
    'tutorials:manage',
    'categories:manage',
    'difficultyLevels:manage',
    'users:manage',
    'reports:view',
    'profile:manage',
  ],
  OPERATOR: [
    'tutorials:manage',
    'categories:manage',
    'difficultyLevels:manage',
    'reports:view',
    'profile:manage',
  ],
};

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
