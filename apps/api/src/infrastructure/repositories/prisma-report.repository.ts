import type { Database } from '../database/prisma.js';
import type { Prisma } from '../../generated/prisma/client.js';
import type { Page, PageRequest } from '../../shared/http/pagination.js';
import { toSkipTake } from '../../shared/http/pagination.js';
import type { ReportRange, ReportRepository, TutorialReportRow } from '../../modules/reports/report.types.js';

export class PrismaReportRepository implements ReportRepository {
  constructor(private readonly db: Database) {}

  async tutorialReport(range: ReportRange, page: PageRequest): Promise<Page<TutorialReportRow>> {
    const where: Prisma.TutorialWhereInput =
      range.from || range.to
        ? { createdAt: { ...(range.from ? { gte: range.from } : {}), ...(range.to ? { lt: range.to } : {}) } }
        : {};
    const [rows, totalItems] = await Promise.all([
      this.db.tutorial.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          author: { select: { id: true, username: true, name: true } },
          category: { select: { title: true } },
          difficultyLevel: { select: { title: true } },
        },
        ...toSkipTake(page),
      }),
      this.db.tutorial.count({ where }),
    ]);
    return {
      items: rows.map((r) => ({
        tutorialId: r.id,
        tutorialTitle: r.title,
        tutorialStatus: r.status,
        author: r.author,
        category: r.category.title,
        difficultyLevel: r.difficultyLevel.title,
        createdAt: r.createdAt,
      })),
      totalItems,
    };
  }
}
