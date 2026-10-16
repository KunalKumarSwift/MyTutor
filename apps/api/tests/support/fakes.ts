/** In-memory implementations of repository interfaces for fast, isolated unit tests. */
import type {
  AuditEventRecord,
  AuditRepository,
  NewAuditEvent,
} from '../../src/modules/audit/audit.types.js';
import type { Clock, SessionRecord, SessionRepository } from '../../src/modules/auth/auth.types.js';
import type { AuthenticatedActor } from '../../src/modules/auth/auth.types.js';
import type {
  PublicReferenceRecord,
  ReferenceListFilter,
  ReferenceRecord,
  ReferenceRepository,
  ReferenceWrite,
} from '../../src/modules/reference-data/reference.types.js';
import type {
  TutorialCounts,
  TutorialFilter,
  TutorialRecord,
  TutorialRepository,
  TutorialWrite,
} from '../../src/modules/tutorials/tutorial.types.js';
import type {
  NewUser,
  UserListFilter,
  UserPatch,
  UserRecord,
  UserRepository,
} from '../../src/modules/users/user.types.js';
import type { Page, PageRequest } from '../../src/shared/http/pagination.js';
import type { PasswordHasher } from '../../src/shared/security/password-hasher.js';

const paginate = <T>(items: T[], page: PageRequest): Page<T> => ({
  items: items.slice((page.page - 1) * page.pageSize, page.page * page.pageSize),
  totalItems: items.length,
});

export class FakeClock implements Clock {
  constructor(public current = new Date('2026-10-01T12:00:00.000Z')) {}
  now() {
    return new Date(this.current);
  }
  advance(ms: number) {
    this.current = new Date(this.current.getTime() + ms);
  }
}

/** Deterministic, reversible-looking "hash" — only for tests. */
export class FakeHasher implements PasswordHasher {
  async hash(password: string) {
    return `hashed:${password}`;
  }
  async verify(hash: string, password: string) {
    return hash === `hashed:${password}`;
  }
}

export class InMemoryUserRepository implements UserRepository {
  users: UserRecord[] = [];
  private nextId = 1;

  seed(partial: Partial<UserRecord> & Pick<UserRecord, 'username'>): UserRecord {
    const now = new Date('2026-01-01T00:00:00Z');
    const user: UserRecord = {
      id: this.nextId++,
      passwordHash: 'hashed:password123',
      role: 'OPERATOR',
      status: 'ACTIVE',
      name: partial.username,
      email: null,
      dateOfBirth: null,
      gender: null,
      address: null,
      mobile: null,
      createdAt: now,
      updatedAt: now,
      ...partial,
    };
    this.users.push(user);
    return user;
  }
  async findById(id: number) {
    return this.users.find((u) => u.id === id) ?? null;
  }
  async findByUsername(username: string) {
    return this.users.find((u) => u.username === username) ?? null;
  }
  async list(filter: UserListFilter, page: PageRequest) {
    const s = filter.search?.toLowerCase();
    return paginate(
      this.users.filter((u) => !s || u.name.toLowerCase().includes(s)),
      page,
    );
  }
  async create(user: NewUser) {
    return this.seed(user);
  }
  async update(id: number, patch: UserPatch) {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('not found');
    Object.assign(user, patch, { updatedAt: new Date() });
    return user;
  }
  async count() {
    return this.users.length;
  }
}

export class InMemorySessionRepository implements SessionRepository {
  sessions: Array<SessionRecord & { tokenHash: string }> = [];
  private nextId = 1;

  async create(input: { userId: number; tokenHash: string; expiresAt: Date }) {
    const session = { id: `s${this.nextId++}`, lastSeenAt: new Date(0), ...input };
    this.sessions.push(session);
    return session;
  }
  async findByTokenHash(tokenHash: string) {
    return this.sessions.find((s) => s.tokenHash === tokenHash) ?? null;
  }
  async touch(id: string, at: Date) {
    const s = this.sessions.find((x) => x.id === id);
    if (s) s.lastSeenAt = at;
  }
  async delete(id: string) {
    this.sessions = this.sessions.filter((s) => s.id !== id);
  }
  async deleteForUser(userId: number, exceptSessionId?: string) {
    const before = this.sessions.length;
    this.sessions = this.sessions.filter((s) => s.userId !== userId || s.id === exceptSessionId);
    return before - this.sessions.length;
  }
  async deleteExpired(now: Date) {
    const before = this.sessions.length;
    this.sessions = this.sessions.filter((s) => s.expiresAt > now);
    return before - this.sessions.length;
  }
}

export class InMemoryAuditRepository implements AuditRepository {
  events: NewAuditEvent[] = [];
  async record(event: NewAuditEvent) {
    this.events.push(event);
  }
  async recent(limit: number): Promise<AuditEventRecord[]> {
    return this.events.slice(-limit).map((e, i) => ({
      id: i + 1,
      action: e.action,
      entityType: e.entityType,
      entityId: e.entityId,
      summary: e.summary,
      actor: null,
      createdAt: new Date(),
    }));
  }
}

export class InMemoryReferenceRepository implements ReferenceRepository {
  records: ReferenceRecord[] = [];
  private nextId = 1;
  /** Lets tutorial fakes report usage counts. */
  usage = new Map<number, number>();

  seed(title: string, status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE'): ReferenceRecord {
    const record: ReferenceRecord = {
      id: this.nextId++,
      title,
      description: null,
      status,
      sortOrder: 0,
      tutorialCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.records.push(record);
    return record;
  }
  private withCount(r: ReferenceRecord): ReferenceRecord {
    return { ...r, tutorialCount: this.usage.get(r.id) ?? 0 };
  }
  async list(filter: ReferenceListFilter, page: PageRequest) {
    return paginate(
      this.records
        .filter(
          (r) =>
            (!filter.status || r.status === filter.status) &&
            (!filter.search || r.title.includes(filter.search)),
        )
        .map((r) => this.withCount(r)),
      page,
    );
  }
  async listActive(): Promise<PublicReferenceRecord[]> {
    return this.records
      .filter((r) => r.status === 'ACTIVE')
      .map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        sortOrder: r.sortOrder,
        publicTutorialCount: 0,
      }));
  }
  async findById(id: number) {
    const r = this.records.find((x) => x.id === id);
    return r ? this.withCount(r) : null;
  }
  async findByTitleKey(key: string) {
    const r = this.records.find((x) => x.title.toLowerCase().replace(/\s+/g, ' ').trim() === key);
    return r ? this.withCount(r) : null;
  }
  async create(data: ReferenceWrite) {
    const r = this.seed(data.title, data.status);
    Object.assign(r, { description: data.description, sortOrder: data.sortOrder });
    return this.withCount(r);
  }
  async update(id: number, data: Partial<ReferenceWrite>) {
    const r = this.records.find((x) => x.id === id)!;
    const { titleKey: _k, ...rest } = data;
    Object.assign(r, rest);
    return this.withCount(r);
  }
  async delete(id: number) {
    this.records = this.records.filter((r) => r.id !== id);
  }
  async count() {
    return this.records.length;
  }
}

export class InMemoryTutorialRepository implements TutorialRepository {
  tutorials: TutorialRecord[] = [];
  private nextId = 1;

  constructor(
    private readonly categories: InMemoryReferenceRepository,
    private readonly levels: InMemoryReferenceRepository,
    private readonly users: InMemoryUserRepository,
  ) {}

  private hydrate(
    data: TutorialWrite & { authorId: number },
    id: number,
    createdAt: Date,
  ): TutorialRecord {
    const c = this.categories.records.find((x) => x.id === data.categoryId)!;
    const l = this.levels.records.find((x) => x.id === data.difficultyLevelId)!;
    const a = this.users.users.find((x) => x.id === data.authorId)!;
    return {
      id,
      title: data.title,
      description: data.description,
      prerequisites: data.prerequisites,
      status: data.status,
      category: { id: c.id, title: c.title, status: c.status },
      difficultyLevel: { id: l.id, title: l.title, status: l.status, sortOrder: l.sortOrder },
      author: { id: a.id, username: a.username, name: a.name },
      createdAt,
      updatedAt: new Date(createdAt),
    };
  }
  private isPublic(t: TutorialRecord) {
    return (
      t.status === 'ACTIVE' &&
      t.category.status === 'ACTIVE' &&
      t.difficultyLevel.status === 'ACTIVE'
    );
  }
  private matches(t: TutorialRecord, f: TutorialFilter) {
    return (
      (!f.search || t.title.toLowerCase().includes(f.search.toLowerCase())) &&
      (f.categoryId === undefined || t.category.id === f.categoryId) &&
      (f.difficultyLevelId === undefined || t.difficultyLevel.id === f.difficultyLevelId) &&
      (!f.status || t.status === f.status)
    );
  }
  async listPublic(filter: TutorialFilter, _sort: string, page: PageRequest) {
    return paginate(
      this.tutorials.filter((t) => this.isPublic(t) && this.matches(t, filter)),
      page,
    );
  }
  async findPublicById(id: number) {
    const t = this.tutorials.find((x) => x.id === id);
    return t && this.isPublic(t) ? t : null;
  }
  async list(filter: TutorialFilter, _sort: string, page: PageRequest) {
    return paginate(
      this.tutorials.filter((t) => this.matches(t, filter)),
      page,
    );
  }
  async findById(id: number) {
    return this.tutorials.find((x) => x.id === id) ?? null;
  }
  async create(data: TutorialWrite & { authorId: number }) {
    const t = this.hydrate(data, this.nextId++, new Date('2026-05-01T00:00:00Z'));
    this.tutorials.push(t);
    return t;
  }
  async update(id: number, data: Partial<TutorialWrite>, expectedUpdatedAt?: Date) {
    const index = this.tutorials.findIndex((x) => x.id === id);
    const current = this.tutorials[index]!;
    if (expectedUpdatedAt && expectedUpdatedAt.getTime() !== current.updatedAt.getTime())
      return null;
    const merged = this.hydrate(
      {
        title: data.title ?? current.title,
        description: data.description ?? current.description,
        prerequisites:
          data.prerequisites !== undefined ? data.prerequisites : current.prerequisites,
        status: data.status ?? current.status,
        categoryId: data.categoryId ?? current.category.id,
        difficultyLevelId: data.difficultyLevelId ?? current.difficultyLevel.id,
        authorId: current.author.id,
      },
      id,
      current.createdAt,
    );
    merged.updatedAt = new Date(current.updatedAt.getTime() + 1000);
    this.tutorials[index] = merged;
    return merged;
  }
  async delete(id: number) {
    this.tutorials = this.tutorials.filter((t) => t.id !== id);
  }
  async counts(): Promise<TutorialCounts> {
    const active = this.tutorials.filter((t) => t.status === 'ACTIVE').length;
    return { total: this.tutorials.length, active, inactive: this.tutorials.length - active };
  }
}

export const silentLogger = { error: () => undefined };

export function actor(overrides: Partial<AuthenticatedActor> = {}): AuthenticatedActor {
  return {
    userId: 1,
    username: 'admin',
    name: 'Admin',
    role: 'ADMIN',
    sessionId: 's-current',
    ...overrides,
  };
}
