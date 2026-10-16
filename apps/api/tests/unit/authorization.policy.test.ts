import { describe, expect, it } from 'vitest';
import { PERMISSIONS } from '@mytutor/contracts';
import { AuthorizationPolicy } from '../../src/modules/auth/authorization.policy.js';
import { actor } from '../support/fakes.js';

describe('AuthorizationPolicy', () => {
  const policy = new AuthorizationPolicy();

  it('grants administrators every permission', () => {
    for (const permission of PERMISSIONS) expect(policy.can(actor({ role: 'ADMIN' }), permission)).toBe(true);
  });

  it('matches the legacy operator menu: everything except user management', () => {
    const operator = actor({ role: 'OPERATOR' });
    expect(policy.can(operator, 'users:manage')).toBe(false);
    for (const p of PERMISSIONS.filter((x) => x !== 'users:manage')) expect(policy.can(operator, p)).toBe(true);
  });

  it('assert throws a FORBIDDEN AppError when denied', () => {
    expect(() => policy.assert(actor({ role: 'OPERATOR' }), 'users:manage')).toThrowError(
      expect.objectContaining({ code: 'FORBIDDEN', statusCode: 403 }),
    );
  });
});
