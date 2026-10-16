import { beforeEach, describe, expect, it } from 'vitest';
import { RepositoryAuditLogger } from '../../src/modules/audit/audit.logger.js';
import { AuthorizationPolicy } from '../../src/modules/auth/authorization.policy.js';
import { ReferenceDataService } from '../../src/modules/reference-data/reference-data.service.js';
import {
  actor,
  InMemoryAuditRepository,
  InMemoryReferenceRepository,
  silentLogger,
} from '../support/fakes.js';

describe('ReferenceDataService', () => {
  let repo: InMemoryReferenceRepository;
  let audit: InMemoryAuditRepository;
  let service: ReferenceDataService;
  const admin = actor();

  beforeEach(() => {
    repo = new InMemoryReferenceRepository();
    audit = new InMemoryAuditRepository();
    service = new ReferenceDataService(
      { label: 'Category', entityType: 'category' },
      'categories:manage',
      repo,
      new AuthorizationPolicy(),
      new RepositoryAuditLogger(audit, silentLogger),
    );
  });

  it('creates with cleaned values and defaults to ACTIVE', async () => {
    const created = await service.create({ title: '  Web   Dev ', description: '  ' }, admin);
    expect(created).toMatchObject({ title: 'Web Dev', description: null, status: 'ACTIVE' });
    expect(audit.events[0]).toMatchObject({
      action: 'category.created',
      summary: 'Created category "Web Dev"',
    });
  });

  it('rejects case- and whitespace-insensitive duplicate titles on create and update', async () => {
    await service.create({ title: 'Web Dev' }, admin);
    const other = await service.create({ title: 'Databases' }, admin);
    await expect(service.create({ title: 'web  dev' }, admin)).rejects.toMatchObject({
      code: 'CONFLICT',
      statusCode: 409,
    });
    await expect(service.update(other.id, { title: 'WEB DEV' }, admin)).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });

  it('allows an update that keeps the record’s own title', async () => {
    const created = await service.create({ title: 'Web Dev' }, admin);
    await expect(
      service.update(created.id, { title: 'web dev', status: 'INACTIVE' }, admin),
    ).resolves.toMatchObject({
      title: 'web dev',
      status: 'INACTIVE',
    });
  });

  it('refuses to delete a record still used by tutorials', async () => {
    const created = await service.create({ title: 'Web Dev' }, admin);
    repo.usage.set(created.id, 3);
    await expect(service.delete(created.id, admin)).rejects.toMatchObject({
      code: 'IN_USE',
      statusCode: 409,
    });
    expect(repo.records).toHaveLength(1);
  });

  it('deletes an unused record', async () => {
    const created = await service.create({ title: 'Web Dev' }, admin);
    await service.delete(created.id, admin);
    expect(repo.records).toHaveLength(0);
  });

  it('returns 404 for missing records', async () => {
    await expect(service.update(9, { title: 'x' }, admin)).rejects.toMatchObject({
      statusCode: 404,
    });
    await expect(service.delete(9, admin)).rejects.toMatchObject({ statusCode: 404 });
  });
});
