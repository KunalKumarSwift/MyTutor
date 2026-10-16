import type { PaginatedResponse, TutorialReportRowDto } from '@mytutor/contracts';
import { invalid } from '../../shared/errors/app-error.js';
import { buildPagination, normalizePage } from '../../shared/http/pagination.js';
import type { AuthenticatedActor } from '../auth/auth.types.js';
import type { AuthorizationPolicy } from '../auth/authorization.policy.js';
import type { ReportRange, ReportRepository } from './report.types.js';

export interface TutorialReportQuery {
  /** YYYY-MM-DD, inclusive. */
  from?: string;
  /** YYYY-MM-DD, inclusive (the whole day is included). */
  to?: string;
  page?: number;
  pageSize?: number;
}

const DAY_MS = 86_400_000;

/**
 * Legacy TutorialReport: tutorials with their author, category and difficulty level,
 * optionally restricted to a creation-date range ("From" / "To").
 */
export class ReportService {
  constructor(
    private readonly reports: ReportRepository,
    private readonly policy: AuthorizationPolicy,
  ) {}

  async tutorialReport(
    query: TutorialReportQuery,
    actor: AuthenticatedActor,
  ): Promise<PaginatedResponse<TutorialReportRowDto>> {
    this.policy.assert(actor, 'reports:view');
    const range: ReportRange = {};
    if (query.from) range.from = new Date(`${query.from}T00:00:00.000Z`);
    if (query.to) range.to = new Date(new Date(`${query.to}T00:00:00.000Z`).getTime() + DAY_MS);
    if (range.from && range.to && range.from >= range.to) {
      throw invalid([{ field: 'to', message: '"To" date must be on or after the "From" date.' }]);
    }
    const page = normalizePage(query.page, query.pageSize, 25);
    const result = await this.reports.tutorialReport(range, page);
    return {
      data: result.items.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
      pagination: buildPagination(page, result.totalItems),
    };
  }
}
