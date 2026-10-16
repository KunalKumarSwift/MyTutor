import type {
  CreateTutorialInput,
  ErrorDetail,
  PaginatedResponse,
  PublicTutorialDto,
  PublicTutorialSummaryDto,
  RecordStatus,
  TutorialDto,
  UpdateTutorialInput,
} from '@mytutor/contracts';
import { AppError, invalid, notFound } from '../../shared/errors/app-error.js';
import { buildPagination, normalizePage } from '../../shared/http/pagination.js';
import { cleanMultiline, cleanText } from '../../shared/text.js';
import type { AuditLogger } from '../audit/audit.types.js';
import type { AuthenticatedActor } from '../auth/auth.types.js';
import type { AuthorizationPolicy } from '../auth/authorization.policy.js';
import type { ReferenceRepository } from '../reference-data/reference.types.js';
import {
  toPublicTutorialDto,
  toPublicTutorialSummaryDto,
  toTutorialDto,
} from './tutorial.mapper.js';
import type {
  TutorialFilter,
  TutorialRepository,
  TutorialSort,
  TutorialWrite,
} from './tutorial.types.js';

export interface TutorialQuery {
  search?: string;
  categoryId?: number;
  difficultyLevelId?: number;
  sort?: TutorialSort;
  page?: number;
  pageSize?: number;
}

export interface ManageTutorialQuery extends TutorialQuery {
  status?: RecordStatus;
}

/**
 * Facade for the tutorial use cases. Coordinates the tutorial repository, the category and
 * difficulty-level repositories (reference checks), the authorization policy and auditing.
 */
export class TutorialFacade {
  constructor(
    private readonly tutorials: TutorialRepository,
    private readonly categories: ReferenceRepository,
    private readonly difficultyLevels: ReferenceRepository,
    private readonly policy: AuthorizationPolicy,
    private readonly audit: AuditLogger,
  ) {}

  // ----- Public -----

  async listPublicTutorials(
    query: TutorialQuery,
  ): Promise<PaginatedResponse<PublicTutorialSummaryDto>> {
    const page = normalizePage(query.page, query.pageSize, 12);
    const result = await this.tutorials.listPublic(toFilter(query), query.sort ?? 'newest', page);
    return {
      data: result.items.map(toPublicTutorialSummaryDto),
      pagination: buildPagination(page, result.totalItems),
    };
  }

  async getPublicTutorial(id: number): Promise<PublicTutorialDto> {
    const tutorial = await this.tutorials.findPublicById(id);
    if (!tutorial) throw notFound('Tutorial');
    return toPublicTutorialDto(tutorial);
  }

  // ----- Management -----

  async listTutorials(
    query: ManageTutorialQuery,
    actor: AuthenticatedActor,
  ): Promise<PaginatedResponse<TutorialDto>> {
    this.policy.assert(actor, 'tutorials:manage');
    const page = normalizePage(query.page, query.pageSize, 20);
    const filter = toFilter(query);
    if (query.status) filter.status = query.status;
    const result = await this.tutorials.list(filter, query.sort ?? 'newest', page);
    return {
      data: result.items.map(toTutorialDto),
      pagination: buildPagination(page, result.totalItems),
    };
  }

  async getTutorial(id: number, actor: AuthenticatedActor): Promise<TutorialDto> {
    this.policy.assert(actor, 'tutorials:manage');
    const tutorial = await this.tutorials.findById(id);
    if (!tutorial) throw notFound('Tutorial');
    return toTutorialDto(tutorial);
  }

  async createTutorial(
    input: CreateTutorialInput,
    actor: AuthenticatedActor,
  ): Promise<TutorialDto> {
    this.policy.assert(actor, 'tutorials:manage');
    await this.assertReferencesAssignable(input.categoryId, input.difficultyLevelId);
    const data: TutorialWrite = {
      title: cleanText(input.title),
      description: cleanMultiline(input.description) ?? '',
      prerequisites: cleanMultiline(input.prerequisites),
      status: input.status ?? 'ACTIVE',
      categoryId: input.categoryId,
      difficultyLevelId: input.difficultyLevelId,
    };
    assertDescription(data.description);
    const created = await this.tutorials.create({ ...data, authorId: actor.userId });
    await this.audit.record({
      actorId: actor.userId,
      action: 'tutorial.created',
      entityType: 'tutorial',
      entityId: String(created.id),
      summary: `Created tutorial "${created.title}"`,
    });
    return toTutorialDto(created);
  }

  async updateTutorial(
    id: number,
    input: UpdateTutorialInput,
    actor: AuthenticatedActor,
  ): Promise<TutorialDto> {
    this.policy.assert(actor, 'tutorials:manage');
    const existing = await this.tutorials.findById(id);
    if (!existing) throw notFound('Tutorial');

    // Only newly assigned references must be active; keeping an existing (now inactive) one is fine.
    await this.assertReferencesAssignable(
      input.categoryId !== undefined && input.categoryId !== existing.category.id
        ? input.categoryId
        : undefined,
      input.difficultyLevelId !== undefined &&
        input.difficultyLevelId !== existing.difficultyLevel.id
        ? input.difficultyLevelId
        : undefined,
    );

    const patch: Partial<TutorialWrite> = {};
    if (input.title !== undefined) patch.title = cleanText(input.title);
    if (input.description !== undefined) {
      patch.description = cleanMultiline(input.description) ?? '';
      assertDescription(patch.description);
    }
    if (input.prerequisites !== undefined)
      patch.prerequisites = cleanMultiline(input.prerequisites);
    if (input.status !== undefined) patch.status = input.status;
    if (input.categoryId !== undefined) patch.categoryId = input.categoryId;
    if (input.difficultyLevelId !== undefined) patch.difficultyLevelId = input.difficultyLevelId;

    const expected = input.expectedUpdatedAt ? new Date(input.expectedUpdatedAt) : undefined;
    const updated = await this.tutorials.update(id, patch, expected);
    if (!updated) {
      throw new AppError(
        'STALE_RECORD',
        409,
        'This tutorial was changed by someone else after you opened it. Reload to see the latest version.',
      );
    }
    await this.audit.record({
      actorId: actor.userId,
      action: 'tutorial.updated',
      entityType: 'tutorial',
      entityId: String(id),
      summary: `Updated tutorial "${updated.title}"`,
    });
    return toTutorialDto(updated);
  }

  /** Hard delete. Tutorials have no dependants, and the legacy model had no archive state beyond status. */
  async deleteTutorial(id: number, actor: AuthenticatedActor): Promise<void> {
    this.policy.assert(actor, 'tutorials:manage');
    const existing = await this.tutorials.findById(id);
    if (!existing) throw notFound('Tutorial');
    await this.tutorials.delete(id);
    await this.audit.record({
      actorId: actor.userId,
      action: 'tutorial.deleted',
      entityType: 'tutorial',
      entityId: String(id),
      summary: `Deleted tutorial "${existing.title}"`,
    });
  }

  private async assertReferencesAssignable(
    categoryId?: number,
    difficultyLevelId?: number,
  ): Promise<void> {
    const [category, level] = await Promise.all([
      categoryId === undefined ? null : this.categories.findById(categoryId),
      difficultyLevelId === undefined ? null : this.difficultyLevels.findById(difficultyLevelId),
    ]);
    const details: ErrorDetail[] = [];
    if (categoryId !== undefined) {
      if (!category)
        details.push({ field: 'categoryId', message: 'Selected category does not exist.' });
      else if (category.status !== 'ACTIVE')
        details.push({ field: 'categoryId', message: 'Selected category is inactive.' });
    }
    if (difficultyLevelId !== undefined) {
      if (!level)
        details.push({
          field: 'difficultyLevelId',
          message: 'Selected difficulty level does not exist.',
        });
      else if (level.status !== 'ACTIVE') {
        details.push({
          field: 'difficultyLevelId',
          message: 'Selected difficulty level is inactive.',
        });
      }
    }
    if (details.length > 0) throw invalid(details);
  }
}

function toFilter(query: TutorialQuery): TutorialFilter {
  const filter: TutorialFilter = {};
  if (query.search?.trim()) filter.search = query.search.trim();
  if (query.categoryId !== undefined) filter.categoryId = query.categoryId;
  if (query.difficultyLevelId !== undefined) filter.difficultyLevelId = query.difficultyLevelId;
  return filter;
}

function assertDescription(description: string): void {
  if (description === '')
    throw invalid([{ field: 'description', message: 'Description is required.' }]);
}
