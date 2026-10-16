import type { FastifyBaseLogger } from 'fastify';
import type { AppConfig } from './config/env.js';
import type { Database } from './infrastructure/database/prisma.js';
import { PrismaAuditRepository } from './infrastructure/repositories/prisma-audit.repository.js';
import {
  PrismaCategoryRepository,
  PrismaDifficultyLevelRepository,
} from './infrastructure/repositories/prisma-reference.repository.js';
import { PrismaReportRepository } from './infrastructure/repositories/prisma-report.repository.js';
import { PrismaSessionRepository } from './infrastructure/repositories/prisma-session.repository.js';
import { PrismaTutorialRepository } from './infrastructure/repositories/prisma-tutorial.repository.js';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository.js';
import { RepositoryAuditLogger } from './modules/audit/audit.logger.js';
import { AuthService } from './modules/auth/auth.service.js';
import { systemClock, type Clock } from './modules/auth/auth.types.js';
import { AuthorizationPolicy } from './modules/auth/authorization.policy.js';
import { DashboardFacade } from './modules/dashboard/dashboard.facade.js';
import { ReferenceDataService } from './modules/reference-data/reference-data.service.js';
import { ReportService } from './modules/reports/report.service.js';
import { TutorialFacade } from './modules/tutorials/tutorial.facade.js';
import { UserFacade } from './modules/users/user.facade.js';
import { Argon2PasswordHasher, type PasswordHasher } from './shared/security/password-hasher.js';

export interface Container {
  db: Database;
  policy: AuthorizationPolicy;
  auth: AuthService;
  users: UserFacade;
  tutorials: TutorialFacade;
  categories: ReferenceDataService;
  difficultyLevels: ReferenceDataService;
  reports: ReportService;
  dashboard: DashboardFacade;
  checkDatabase(): Promise<void>;
}

export interface ContainerOverrides {
  hasher?: PasswordHasher;
  clock?: Clock;
}

/** Composition root: the only place concrete implementations are chosen and wired together. */
export function createContainer(
  config: AppConfig,
  db: Database,
  logger: FastifyBaseLogger,
  overrides: ContainerOverrides = {},
): Container {
  const hasher = overrides.hasher ?? new Argon2PasswordHasher();
  const clock = overrides.clock ?? systemClock;

  const userRepository = new PrismaUserRepository(db);
  const sessionRepository = new PrismaSessionRepository(db);
  const auditRepository = new PrismaAuditRepository(db);
  const categoryRepository = new PrismaCategoryRepository(db);
  const levelRepository = new PrismaDifficultyLevelRepository(db);
  const tutorialRepository = new PrismaTutorialRepository(db);

  const policy = new AuthorizationPolicy();
  const audit = new RepositoryAuditLogger(auditRepository, logger);

  return {
    db,
    policy,
    auth: new AuthService(userRepository, sessionRepository, hasher, clock, {
      sessionSecret: config.sessionSecret,
      sessionTtlSeconds: config.sessionTtlSeconds,
    }),
    users: new UserFacade(userRepository, sessionRepository, hasher, policy, audit),
    tutorials: new TutorialFacade(
      tutorialRepository,
      categoryRepository,
      levelRepository,
      policy,
      audit,
    ),
    categories: new ReferenceDataService(
      { label: 'Category', entityType: 'category' },
      'categories:manage',
      categoryRepository,
      policy,
      audit,
    ),
    difficultyLevels: new ReferenceDataService(
      { label: 'Difficulty level', entityType: 'difficulty_level' },
      'difficultyLevels:manage',
      levelRepository,
      policy,
      audit,
    ),
    reports: new ReportService(new PrismaReportRepository(db), policy),
    dashboard: new DashboardFacade(
      tutorialRepository,
      categoryRepository,
      levelRepository,
      userRepository,
      auditRepository,
      policy,
    ),
    async checkDatabase() {
      await db.$queryRaw`SELECT 1`;
    },
  };
}
