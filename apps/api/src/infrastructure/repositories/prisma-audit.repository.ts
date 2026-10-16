import type { Database } from '../database/prisma.js';
import type {
  AuditEventRecord,
  AuditRepository,
  NewAuditEvent,
} from '../../modules/audit/audit.types.js';

export class PrismaAuditRepository implements AuditRepository {
  constructor(private readonly db: Database) {}

  async record(event: NewAuditEvent): Promise<void> {
    await this.db.auditEvent.create({ data: event });
  }

  async recent(limit: number): Promise<AuditEventRecord[]> {
    const rows = await this.db.auditEvent.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      include: { actor: { select: { id: true, username: true } } },
    });
    return rows.map(({ actorId: _actorId, ...row }) => row);
  }
}
