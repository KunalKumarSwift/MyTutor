import type { Role } from '@mytutor/contracts';

/** The authenticated principal attached to a request. */
export interface AuthenticatedActor {
  userId: number;
  username: string;
  name: string;
  role: Role;
  sessionId: string;
}

export interface SessionRecord {
  id: string;
  userId: number;
  expiresAt: Date;
  lastSeenAt: Date;
}

export interface SessionRepository {
  create(input: { userId: number; tokenHash: string; expiresAt: Date }): Promise<SessionRecord>;
  findByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  touch(id: string, at: Date): Promise<void>;
  delete(id: string): Promise<void>;
  /** Revokes every session of a user, optionally keeping one (the caller's current session). */
  deleteForUser(userId: number, exceptSessionId?: string): Promise<number>;
  deleteExpired(now: Date): Promise<number>;
}

export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };
