import type { Permission, RecordStatus } from '@mytutor/contracts';
import { AppError, conflict, notFound } from '../../shared/errors/app-error.js';
import { buildPagination, normalizePage } from '../../shared/http/pagination.js';
import { cleanMultiline, cleanText, titleKey } from '../../shared/text.js';
import type { AuditLogger } from '../audit/audit.types.js';
import type { AuthenticatedActor } from '../auth/auth.types.js';
import type { AuthorizationPolicy } from '../auth/authorization.policy.js';
import type {
  PublicReferenceRecord,
  ReferenceKind,
  ReferenceListFilter,
  ReferenceRecord,
  ReferenceRepository,
  ReferenceWrite,
} from './reference.types.js';

export interface ReferenceInput {
  title: string;
  description?: string | null;
  status?: RecordStatus;
  sortOrder?: number;
}

export interface ReferenceListQuery extends ReferenceListFilter {
  page?: number;
  pageSize?: number;
}

/**
 * Business rules for categories and difficulty levels:
 * - titles are unique, case-insensitively (legacy checked exact duplicates on create only);
 * - a record used by tutorials cannot be deleted — deactivate it instead.
 */
export class ReferenceDataService {
  constructor(
    private readonly kind: ReferenceKind,
    private readonly permission: Permission,
    private readonly repository: ReferenceRepository,
    private readonly policy: AuthorizationPolicy,
    private readonly audit: AuditLogger,
  ) {}

  listActive(): Promise<PublicReferenceRecord[]> {
    return this.repository.listActive();
  }

  async list(query: ReferenceListQuery, actor: AuthenticatedActor) {
    this.policy.assert(actor, this.permission);
    const page = normalizePage(query.page, query.pageSize, 20);
    const filter: ReferenceListFilter = {};
    if (query.search?.trim()) filter.search = query.search.trim();
    if (query.status) filter.status = query.status;
    const result = await this.repository.list(filter, page);
    return { items: result.items, pagination: buildPagination(page, result.totalItems) };
  }

  async get(id: number, actor: AuthenticatedActor): Promise<ReferenceRecord> {
    this.policy.assert(actor, this.permission);
    return this.require(id);
  }

  async findExisting(id: number): Promise<ReferenceRecord | null> {
    return this.repository.findById(id);
  }

  async create(input: ReferenceInput, actor: AuthenticatedActor): Promise<ReferenceRecord> {
    this.policy.assert(actor, this.permission);
    const data: ReferenceWrite = {
      title: cleanText(input.title),
      titleKey: titleKey(input.title),
      description: cleanMultiline(input.description),
      status: input.status ?? 'ACTIVE',
      sortOrder: input.sortOrder ?? 0,
    };
    await this.assertTitleAvailable(data.titleKey);
    const created = await this.repository.create(data);
    await this.record(actor, 'created', created);
    return created;
  }

  async update(id: number, input: Partial<ReferenceInput>, actor: AuthenticatedActor): Promise<ReferenceRecord> {
    this.policy.assert(actor, this.permission);
    await this.require(id);
    const patch: Partial<ReferenceWrite> = {};
    if (input.title !== undefined) {
      patch.title = cleanText(input.title);
      patch.titleKey = titleKey(input.title);
      await this.assertTitleAvailable(patch.titleKey, id);
    }
    if (input.description !== undefined) patch.description = cleanMultiline(input.description);
    if (input.status !== undefined) patch.status = input.status;
    if (input.sortOrder !== undefined) patch.sortOrder = input.sortOrder;
    const updated = await this.repository.update(id, patch);
    await this.record(actor, 'updated', updated);
    return updated;
  }

  async delete(id: number, actor: AuthenticatedActor): Promise<void> {
    this.policy.assert(actor, this.permission);
    const existing = await this.require(id);
    if (existing.tutorialCount > 0) {
      throw new AppError(
        'IN_USE',
        409,
        `This ${this.kind.label.toLowerCase()} is used by ${existing.tutorialCount} tutorial(s). ` +
          'Reassign those tutorials or mark it inactive instead.',
      );
    }
    // The foreign key is RESTRICT, so a tutorial created concurrently still cannot be orphaned.
    await this.repository.delete(id);
    await this.record(actor, 'deleted', existing);
  }

  count(): Promise<number> {
    return this.repository.count();
  }

  private async require(id: number): Promise<ReferenceRecord> {
    const record = await this.repository.findById(id);
    if (!record) throw notFound(this.kind.label);
    return record;
  }

  private async assertTitleAvailable(key: string, exceptId?: number): Promise<void> {
    const clash = await this.repository.findByTitleKey(key);
    if (clash && clash.id !== exceptId) {
      throw conflict(`${this.kind.label} already exists.`, [
        { field: 'title', message: `A ${this.kind.label.toLowerCase()} with this title already exists.` },
      ]);
    }
  }

  private record(actor: AuthenticatedActor, verb: string, record: ReferenceRecord) {
    return this.audit.record({
      actorId: actor.userId,
      action: `${this.kind.entityType}.${verb}`,
      entityType: this.kind.entityType,
      entityId: String(record.id),
      summary: `${verb[0]!.toUpperCase()}${verb.slice(1)} ${this.kind.label.toLowerCase()} "${record.title}"`,
    });
  }
}
