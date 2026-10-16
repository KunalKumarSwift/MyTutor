import { beforeEach, describe, expect, it } from 'vitest';
import { RepositoryAuditLogger } from '../../src/modules/audit/audit.logger.js';
import { AuthorizationPolicy } from '../../src/modules/auth/authorization.policy.js';
import { TutorialFacade } from '../../src/modules/tutorials/tutorial.facade.js';
import {
  actor,
  InMemoryAuditRepository,
  InMemoryReferenceRepository,
  InMemoryTutorialRepository,
  InMemoryUserRepository,
  silentLogger,
} from '../support/fakes.js';

describe('TutorialFacade', () => {
  let categories: InMemoryReferenceRepository;
  let levels: InMemoryReferenceRepository;
  let tutorials: InMemoryTutorialRepository;
  let audit: InMemoryAuditRepository;
  let facade: TutorialFacade;
  const admin = actor();
  const operator = actor({ userId: 2, username: 'op', role: 'OPERATOR' });

  beforeEach(() => {
    const users = new InMemoryUserRepository();
    users.seed({ username: 'admin', role: 'ADMIN' });
    users.seed({ username: 'op' });
    categories = new InMemoryReferenceRepository();
    levels = new InMemoryReferenceRepository();
    categories.seed('Web');
    categories.seed('Retired', 'INACTIVE');
    levels.seed('Beginner');
    levels.seed('Expert', 'INACTIVE');
    tutorials = new InMemoryTutorialRepository(categories, levels, users);
    audit = new InMemoryAuditRepository();
    facade = new TutorialFacade(
      tutorials,
      categories,
      levels,
      new AuthorizationPolicy(),
      new RepositoryAuditLogger(audit, silentLogger),
    );
  });

  const valid = {
    title: '  Intro   to HTML ',
    description: 'Body\r\n\r\nMore',
    categoryId: 1,
    difficultyLevelId: 1,
  };

  it('creates a tutorial with cleaned text, the actor as author, and an audit entry', async () => {
    const created = await facade.createTutorial({ ...valid, prerequisites: '   ' }, operator);
    expect(created).toMatchObject({
      title: 'Intro to HTML',
      description: 'Body\n\nMore',
      prerequisites: null,
      status: 'ACTIVE',
      author: { id: 2 },
    });
    expect(audit.events).toEqual([
      expect.objectContaining({ action: 'tutorial.created', actorId: 2 }),
    ]);
  });

  it('rejects unknown and inactive references with field-level details', async () => {
    await expect(
      facade.createTutorial({ ...valid, categoryId: 99, difficultyLevelId: 2 }, admin),
    ).rejects.toMatchObject({
      statusCode: 422,
      details: [
        { field: 'categoryId', message: 'Selected category does not exist.' },
        { field: 'difficultyLevelId', message: 'Selected difficulty level is inactive.' },
      ],
    });
    expect(tutorials.tutorials).toHaveLength(0);
  });

  it('allows keeping an existing reference that has since become inactive', async () => {
    const created = await facade.createTutorial(valid, admin);
    categories.records[0]!.status = 'INACTIVE';
    const updated = await facade.updateTutorial(
      created.id,
      { title: 'Renamed', categoryId: 1 },
      admin,
    );
    expect(updated.title).toBe('Renamed');
    await expect(facade.updateTutorial(created.id, { categoryId: 2 }, admin)).rejects.toMatchObject(
      { statusCode: 422 },
    );
  });

  it('does not erase omitted fields on partial update', async () => {
    const created = await facade.createTutorial({ ...valid, prerequisites: 'HTML' }, admin);
    const updated = await facade.updateTutorial(created.id, { status: 'INACTIVE' }, admin);
    expect(updated).toMatchObject({
      prerequisites: 'HTML',
      title: 'Intro to HTML',
      status: 'INACTIVE',
    });
    const cleared = await facade.updateTutorial(created.id, { prerequisites: null }, admin);
    expect(cleared.prerequisites).toBeNull();
  });

  it('detects concurrent edits with expectedUpdatedAt', async () => {
    const created = await facade.createTutorial(valid, admin);
    await facade.updateTutorial(
      created.id,
      { title: 'First', expectedUpdatedAt: created.updatedAt },
      admin,
    );
    await expect(
      facade.updateTutorial(
        created.id,
        { title: 'Second', expectedUpdatedAt: created.updatedAt },
        admin,
      ),
    ).rejects.toMatchObject({ code: 'STALE_RECORD', statusCode: 409 });
  });

  it('hides inactive tutorials and tutorials in inactive categories from the public', async () => {
    const visible = await facade.createTutorial(valid, admin);
    const hidden = await facade.createTutorial({ ...valid, status: 'INACTIVE' }, admin);
    expect((await facade.listPublicTutorials({})).data.map((t) => t.id)).toEqual([visible.id]);
    await expect(facade.getPublicTutorial(hidden.id)).rejects.toMatchObject({ code: 'NOT_FOUND' });

    categories.records[0]!.status = 'INACTIVE';
    tutorials.tutorials.forEach((t) => (t.category.status = 'INACTIVE'));
    expect((await facade.listPublicTutorials({})).pagination.totalItems).toBe(0);
  });

  it('returns 404 when updating or deleting a missing tutorial', async () => {
    await expect(facade.updateTutorial(42, { title: 'x' }, admin)).rejects.toMatchObject({
      statusCode: 404,
    });
    await expect(facade.deleteTutorial(42, admin)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('deletes and audits', async () => {
    const created = await facade.createTutorial(valid, admin);
    await facade.deleteTutorial(created.id, admin);
    expect(tutorials.tutorials).toHaveLength(0);
    expect(audit.events.at(-1)).toMatchObject({ action: 'tutorial.deleted' });
  });

  it('caps the page size and computes pagination', async () => {
    for (let i = 0; i < 3; i++) await facade.createTutorial(valid, admin);
    const page = await facade.listPublicTutorials({ page: 2, pageSize: 2 });
    expect(page.pagination).toEqual({ page: 2, pageSize: 2, totalItems: 3, totalPages: 2 });
    expect(page.data).toHaveLength(1);
    expect((await facade.listPublicTutorials({ pageSize: 10_000 })).pagination.pageSize).toBe(50);
  });
});
