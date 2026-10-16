import type { Database } from '../database/prisma.js';
import type { SessionRecord, SessionRepository } from '../../modules/auth/auth.types.js';

const select = { id: true, userId: true, expiresAt: true, lastSeenAt: true } as const;

export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly db: Database) {}

  create(input: { userId: number; tokenHash: string; expiresAt: Date }): Promise<SessionRecord> {
    return this.db.session.create({ data: input, select });
  }

  findByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    return this.db.session.findUnique({ where: { tokenHash }, select });
  }

  async touch(id: string, at: Date): Promise<void> {
    await this.db.session.updateMany({ where: { id }, data: { lastSeenAt: at } });
  }

  async delete(id: string): Promise<void> {
    await this.db.session.deleteMany({ where: { id } });
  }

  async deleteForUser(userId: number, exceptSessionId?: string): Promise<number> {
    const result = await this.db.session.deleteMany({
      where: { userId, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
    });
    return result.count;
  }

  async deleteExpired(now: Date): Promise<number> {
    const result = await this.db.session.deleteMany({ where: { expiresAt: { lte: now } } });
    return result.count;
  }
}
