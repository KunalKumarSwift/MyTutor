import type { Database } from '../database/prisma.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { mapPrismaError } from '../database/prisma-errors.js';
import type { Page, PageRequest } from '../../shared/http/pagination.js';
import { toSkipTake } from '../../shared/http/pagination.js';
import type {
  TutorialCounts,
  TutorialFilter,
  TutorialRecord,
  TutorialRepository,
  TutorialSort,
  TutorialWrite,
} from '../../modules/tutorials/tutorial.types.js';

const include = {
  category: { select: { id: true, title: true, status: true } },
  difficultyLevel: { select: { id: true, title: true, status: true, sortOrder: true } },
  author: { select: { id: true, username: true, name: true } },
} satisfies Prisma.TutorialInclude;

type TutorialRow = Prisma.TutorialGetPayload<{ include: typeof include }>;

const PUBLIC_WHERE = {
  status: 'ACTIVE',
  category: { status: 'ACTIVE' },
  difficultyLevel: { status: 'ACTIVE' },
} satisfies Prisma.TutorialWhereInput;

function toRecord(row: TutorialRow): TutorialRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    prerequisites: row.prerequisites,
    status: row.status,
    category: row.category,
    difficultyLevel: row.difficultyLevel,
    author: row.author,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toWhere(filter: TutorialFilter): Prisma.TutorialWhereInput {
  return {
    ...(filter.search
      ? {
          OR: [
            { title: { contains: filter.search, mode: 'insensitive' } },
            { description: { contains: filter.search, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(filter.categoryId !== undefined ? { categoryId: filter.categoryId } : {}),
    ...(filter.difficultyLevelId !== undefined
      ? { difficultyLevelId: filter.difficultyLevelId }
      : {}),
    ...(filter.status ? { status: filter.status } : {}),
  };
}

function toOrderBy(sort: TutorialSort): Prisma.TutorialOrderByWithRelationInput[] {
  switch (sort) {
    case 'oldest':
      return [{ createdAt: 'asc' }, { id: 'asc' }];
    case 'title':
      return [{ title: 'asc' }, { id: 'asc' }];
    case 'newest':
      return [{ createdAt: 'desc' }, { id: 'desc' }];
  }
}

export class PrismaTutorialRepository implements TutorialRepository {
  constructor(private readonly db: Database) {}

  listPublic(filter: Omit<TutorialFilter, 'status'>, sort: TutorialSort, page: PageRequest) {
    return this.page({ AND: [PUBLIC_WHERE, toWhere(filter)] }, sort, page);
  }

  async findPublicById(id: number): Promise<TutorialRecord | null> {
    const row = await this.db.tutorial.findFirst({ where: { id, ...PUBLIC_WHERE }, include });
    return row ? toRecord(row) : null;
  }

  list(filter: TutorialFilter, sort: TutorialSort, page: PageRequest) {
    return this.page(toWhere(filter), sort, page);
  }

  async findById(id: number): Promise<TutorialRecord | null> {
    const row = await this.db.tutorial.findUnique({ where: { id }, include });
    return row ? toRecord(row) : null;
  }

  async create(data: TutorialWrite & { authorId: number }): Promise<TutorialRecord> {
    try {
      return toRecord(await this.db.tutorial.create({ data, include }));
    } catch (error) {
      mapPrismaError(error, 'Tutorial');
    }
  }

  async update(
    id: number,
    data: Partial<TutorialWrite>,
    expectedUpdatedAt?: Date,
  ): Promise<TutorialRecord | null> {
    try {
      if (expectedUpdatedAt) {
        // Conditional write: only applies if nobody changed the row since it was loaded.
        const result = await this.db.tutorial.updateMany({
          where: { id, updatedAt: expectedUpdatedAt },
          data,
        });
        if (result.count === 0) return null;
        const row = await this.db.tutorial.findUniqueOrThrow({ where: { id }, include });
        return toRecord(row);
      }
      return toRecord(await this.db.tutorial.update({ where: { id }, data, include }));
    } catch (error) {
      mapPrismaError(error, 'Tutorial');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.db.tutorial.delete({ where: { id } });
    } catch (error) {
      mapPrismaError(error, 'Tutorial');
    }
  }

  async counts(): Promise<TutorialCounts> {
    const groups = await this.db.tutorial.groupBy({ by: ['status'], _count: { _all: true } });
    const active = groups.find((g) => g.status === 'ACTIVE')?._count._all ?? 0;
    const inactive = groups.find((g) => g.status === 'INACTIVE')?._count._all ?? 0;
    return { total: active + inactive, active, inactive };
  }

  private async page(
    where: Prisma.TutorialWhereInput,
    sort: TutorialSort,
    page: PageRequest,
  ): Promise<Page<TutorialRecord>> {
    const [rows, totalItems] = await Promise.all([
      this.db.tutorial.findMany({ where, include, orderBy: toOrderBy(sort), ...toSkipTake(page) }),
      this.db.tutorial.count({ where }),
    ]);
    return { items: rows.map(toRecord), totalItems };
  }
}
