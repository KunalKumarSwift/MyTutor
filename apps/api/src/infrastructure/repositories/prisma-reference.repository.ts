import type { Database } from '../database/prisma.js';
import { mapPrismaError } from '../database/prisma-errors.js';
import type { Page, PageRequest } from '../../shared/http/pagination.js';
import { toSkipTake } from '../../shared/http/pagination.js';
import type {
  PublicReferenceRecord,
  ReferenceListFilter,
  ReferenceRecord,
  ReferenceRepository,
  ReferenceWrite,
} from '../../modules/reference-data/reference.types.js';

interface ReferenceRow {
  id: number;
  title: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
  _count: { tutorials: number };
}

function toRecord(row: ReferenceRow): ReferenceRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    sortOrder: row.sortOrder ?? 0,
    tutorialCount: row._count.tutorials,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toPublic(row: ReferenceRow): PublicReferenceRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    sortOrder: row.sortOrder ?? 0,
    publicTutorialCount: row._count.tutorials,
  };
}

const withCount = { _count: { select: { tutorials: true } } } as const;

const listWhere = (filter: ReferenceListFilter) => ({
  ...(filter.search ? { title: { contains: filter.search, mode: 'insensitive' as const } } : {}),
  ...(filter.status ? { status: filter.status } : {}),
});

export class PrismaCategoryRepository implements ReferenceRepository {
  constructor(private readonly db: Database) {}

  async list(filter: ReferenceListFilter, page: PageRequest): Promise<Page<ReferenceRecord>> {
    const where = listWhere(filter);
    const [rows, totalItems] = await this.db.$transaction([
      this.db.category.findMany({ where, include: withCount, orderBy: [{ title: 'asc' }], ...toSkipTake(page) }),
      this.db.category.count({ where }),
    ]);
    return { items: rows.map(toRecord), totalItems };
  }

  async listActive(): Promise<PublicReferenceRecord[]> {
    const rows = await this.db.category.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { title: 'asc' },
      include: {
        _count: {
          select: { tutorials: { where: { status: 'ACTIVE', difficultyLevel: { status: 'ACTIVE' } } } },
        },
      },
    });
    return rows.map(toPublic);
  }

  async findById(id: number): Promise<ReferenceRecord | null> {
    const row = await this.db.category.findUnique({ where: { id }, include: withCount });
    return row ? toRecord(row) : null;
  }

  async findByTitleKey(titleKey: string): Promise<ReferenceRecord | null> {
    const row = await this.db.category.findUnique({ where: { titleKey }, include: withCount });
    return row ? toRecord(row) : null;
  }

  async create({ sortOrder: _sortOrder, ...data }: ReferenceWrite): Promise<ReferenceRecord> {
    try {
      return toRecord(await this.db.category.create({ data, include: withCount }));
    } catch (error) {
      mapPrismaError(error, 'Category');
    }
  }

  async update(id: number, { sortOrder: _sortOrder, ...data }: Partial<ReferenceWrite>): Promise<ReferenceRecord> {
    try {
      return toRecord(await this.db.category.update({ where: { id }, data, include: withCount }));
    } catch (error) {
      mapPrismaError(error, 'Category');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.db.category.delete({ where: { id } });
    } catch (error) {
      mapPrismaError(error, 'Category');
    }
  }

  count(): Promise<number> {
    return this.db.category.count();
  }
}

export class PrismaDifficultyLevelRepository implements ReferenceRepository {
  constructor(private readonly db: Database) {}

  private readonly order = [{ sortOrder: 'asc' as const }, { title: 'asc' as const }];

  async list(filter: ReferenceListFilter, page: PageRequest): Promise<Page<ReferenceRecord>> {
    const where = listWhere(filter);
    const [rows, totalItems] = await this.db.$transaction([
      this.db.difficultyLevel.findMany({ where, include: withCount, orderBy: this.order, ...toSkipTake(page) }),
      this.db.difficultyLevel.count({ where }),
    ]);
    return { items: rows.map(toRecord), totalItems };
  }

  async listActive(): Promise<PublicReferenceRecord[]> {
    const rows = await this.db.difficultyLevel.findMany({
      where: { status: 'ACTIVE' },
      orderBy: this.order,
      include: {
        _count: { select: { tutorials: { where: { status: 'ACTIVE', category: { status: 'ACTIVE' } } } } },
      },
    });
    return rows.map(toPublic);
  }

  async findById(id: number): Promise<ReferenceRecord | null> {
    const row = await this.db.difficultyLevel.findUnique({ where: { id }, include: withCount });
    return row ? toRecord(row) : null;
  }

  async findByTitleKey(titleKey: string): Promise<ReferenceRecord | null> {
    const row = await this.db.difficultyLevel.findUnique({ where: { titleKey }, include: withCount });
    return row ? toRecord(row) : null;
  }

  async create(data: ReferenceWrite): Promise<ReferenceRecord> {
    try {
      return toRecord(await this.db.difficultyLevel.create({ data, include: withCount }));
    } catch (error) {
      mapPrismaError(error, 'Difficulty level');
    }
  }

  async update(id: number, data: Partial<ReferenceWrite>): Promise<ReferenceRecord> {
    try {
      return toRecord(await this.db.difficultyLevel.update({ where: { id }, data, include: withCount }));
    } catch (error) {
      mapPrismaError(error, 'Difficulty level');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.db.difficultyLevel.delete({ where: { id } });
    } catch (error) {
      mapPrismaError(error, 'Difficulty level');
    }
  }

  count(): Promise<number> {
    return this.db.difficultyLevel.count();
  }
}
