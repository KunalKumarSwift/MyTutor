export interface AuditEventRecord {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  actor: { id: number; username: string } | null;
  createdAt: Date;
}

export interface NewAuditEvent {
  actorId: number | null;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
}

export interface AuditRepository {
  record(event: NewAuditEvent): Promise<void>;
  recent(limit: number): Promise<AuditEventRecord[]>;
}

/** Narrow interface consumed by facades. */
export interface AuditLogger {
  record(event: NewAuditEvent): Promise<void>;
}
