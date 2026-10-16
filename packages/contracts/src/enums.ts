/** Roles that can authenticate. A guest is an unauthenticated visitor, not a role. */
export const ROLES = ['ADMIN', 'OPERATOR'] as const;
export type Role = (typeof ROLES)[number];

/**
 * Lifecycle status shared by users, categories, difficulty levels and tutorials.
 * Mirrors the legacy `Active` / `Inactive` columns.
 */
export const RECORD_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];

export const GENDERS = ['MALE', 'FEMALE'] as const;
export type Gender = (typeof GENDERS)[number];
