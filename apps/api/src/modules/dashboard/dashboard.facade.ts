import type { DashboardDto } from '@mytutor/contracts';
import { normalizePage } from '../../shared/http/pagination.js';
import type { AuditRepository } from '../audit/audit.types.js';
import type { AuthenticatedActor } from '../auth/auth.types.js';
import type { AuthorizationPolicy } from '../auth/authorization.policy.js';
import type { ReferenceRepository } from '../reference-data/reference.types.js';
import type { TutorialRepository } from '../tutorials/tutorial.types.js';
import type { UserRepository } from '../users/user.types.js';

/** Aggregates the management home page from several repositories in parallel. */
export class DashboardFacade {
  constructor(
    private readonly tutorials: TutorialRepository,
    private readonly categories: ReferenceRepository,
    private readonly difficultyLevels: ReferenceRepository,
    private readonly users: UserRepository,
    private readonly audit: AuditRepository,
    private readonly policy: AuthorizationPolicy,
  ) {}

  async overview(actor: AuthenticatedActor): Promise<DashboardDto> {
    this.policy.assert(actor, 'tutorials:manage');
    const canSeeUsers = this.policy.can(actor, 'users:manage');
    const [counts, categories, levels, users, recent, activity] = await Promise.all([
      this.tutorials.counts(),
      this.categories.count(),
      this.difficultyLevels.count(),
      canSeeUsers ? this.users.count() : Promise.resolve(null),
      this.tutorials.list({}, 'newest', normalizePage(1, 5)),
      this.audit.recent(8),
    ]);
    return {
      tutorials: counts,
      categories,
      difficultyLevels: levels,
      users,
      recentTutorials: recent.items.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
      })),
      recentActivity: activity.map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
    };
  }
}
