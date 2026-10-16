import type { FastifyBaseLogger } from 'fastify';
import type { AuditLogger, AuditRepository, NewAuditEvent } from './audit.types.js';

/**
 * Records audit events after the primary change has committed. An audit failure is logged
 * at error level but does not turn an already-persisted change into a client-facing failure.
 */
export class RepositoryAuditLogger implements AuditLogger {
  constructor(
    private readonly repository: AuditRepository,
    private readonly logger: Pick<FastifyBaseLogger, 'error'>,
  ) {}

  async record(event: NewAuditEvent): Promise<void> {
    try {
      await this.repository.record({ ...event, summary: event.summary.slice(0, 300) });
    } catch (error) {
      this.logger.error({ err: error, audit: { action: event.action, entityType: event.entityType } }, 'Failed to record audit event');
    }
  }
}
