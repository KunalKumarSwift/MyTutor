import { hash, verify, type Algorithm } from '@node-rs/argon2';

/** Value of the library's (ambient const) `Algorithm.Argon2id`. */
const ARGON2ID = 2 as Algorithm;

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(hash: string, password: string): Promise<boolean>;
}

/**
 * Argon2id using OWASP's recommended minimum profile (19 MiB, 2 iterations, 1 lane).
 * Parameters are encoded in each hash, so they can be raised later without breaking old hashes.
 */
export class Argon2PasswordHasher implements PasswordHasher {
  private readonly options = {
    algorithm: ARGON2ID,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  } as const;

  hash(password: string): Promise<string> {
    return hash(password, this.options);
  }

  async verify(passwordHash: string, password: string): Promise<boolean> {
    try {
      return await verify(passwordHash, password);
    } catch {
      // A malformed stored hash must never authenticate.
      return false;
    }
  }
}

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
