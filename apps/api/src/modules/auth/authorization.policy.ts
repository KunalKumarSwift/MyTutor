import { roleHasPermission, type Permission } from '@mytutor/contracts';
import { forbidden } from '../../shared/errors/app-error.js';
import type { AuthenticatedActor } from './auth.types.js';

/** Single place where role → capability decisions are made on the server. */
export class AuthorizationPolicy {
  can(actor: AuthenticatedActor, permission: Permission): boolean {
    return roleHasPermission(actor.role, permission);
  }

  assert(actor: AuthenticatedActor, permission: Permission): void {
    if (!this.can(actor, permission)) throw forbidden();
  }
}
