import type { Database } from '../database/prisma.js';
import type { Prisma, User } from '../../generated/prisma/client.js';
import { mapPrismaError } from '../database/prisma-errors.js';
import type { Page, PageRequest } from '../../shared/http/pagination.js';
import { toSkipTake } from '../../shared/http/pagination.js';
import type {
  NewUser,
  UserListFilter,
  UserPatch,
  UserRecord,
  UserRepository,
} from '../../modules/users/user.types.js';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: Database) {}

  async findById(id: number): Promise<UserRecord | null> {
    const user = await this.db.user.findUnique({ where: { id } });
    return user ? toRecord(user) : null;
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    const user = await this.db.user.findUnique({ where: { username } });
    return user ? toRecord(user) : null;
  }

  async list(filter: UserListFilter, page: PageRequest): Promise<Page<UserRecord>> {
    // Legacy ManageUser searched by name; username is included for convenience.
    const where: Prisma.UserWhereInput = filter.search
      ? {
          OR: [
            { name: { contains: filter.search, mode: 'insensitive' } },
            { username: { contains: filter.search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [items, totalItems] = await Promise.all([
      this.db.user.findMany({ where, orderBy: [{ name: 'asc' }, { id: 'asc' }], ...toSkipTake(page) }),
      this.db.user.count({ where }),
    ]);
    return { items: items.map(toRecord), totalItems };
  }

  async create(user: NewUser): Promise<UserRecord> {
    try {
      const created = await this.db.user.create({
        data: { ...user, dateOfBirth: toDbDate(user.dateOfBirth) },
      });
      return toRecord(created);
    } catch (error) {
      mapPrismaError(error, 'User');
    }
  }

  async update(id: number, patch: UserPatch): Promise<UserRecord> {
    const { dateOfBirth, ...rest } = patch;
    try {
      const updated = await this.db.user.update({
        where: { id },
        data: { ...rest, ...(dateOfBirth !== undefined ? { dateOfBirth: toDbDate(dateOfBirth) } : {}) },
      });
      return toRecord(updated);
    } catch (error) {
      mapPrismaError(error, 'User');
    }
  }

  count(): Promise<number> {
    return this.db.user.count();
  }
}

function toDbDate(value: string | null): Date | null {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function toRecord(user: User): UserRecord {
  return {
    id: user.id,
    username: user.username,
    passwordHash: user.passwordHash,
    role: user.role,
    status: user.status,
    name: user.name,
    email: user.email,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : null,
    gender: user.gender,
    address: user.address,
    mobile: user.mobile,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
