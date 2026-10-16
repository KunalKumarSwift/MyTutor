import { describe, expect, it } from 'vitest';
import { loadConfig } from '../../src/config/env.js';
import { buildPagination, normalizePage } from '../../src/shared/http/pagination.js';
import { cleanMultiline, excerpt, titleKey } from '../../src/shared/text.js';
import {
  deriveCsrfToken,
  generateSessionToken,
  hashSessionToken,
  safeEqual,
} from '../../src/shared/security/tokens.js';
import { ReportService } from '../../src/modules/reports/report.service.js';
import { AuthorizationPolicy } from '../../src/modules/auth/authorization.policy.js';
import { actor } from '../support/fakes.js';

const baseEnv = { DATABASE_URL: 'postgresql://x', SESSION_SECRET: 'a'.repeat(40) };

describe('loadConfig', () => {
  it('applies defaults and parses lists and booleans', () => {
    const config = loadConfig({
      ...baseEnv,
      ALLOWED_ORIGINS: 'http://a.test/, http://b.test',
      COOKIE_SECURE: 'true',
      PORT: '4000',
    });
    expect(config).toMatchObject({
      port: 4000,
      cookieSecure: true,
      sessionTtlSeconds: 28800,
      allowedOrigins: ['http://a.test', 'http://b.test'],
    });
  });

  it('fails fast on missing or invalid values', () => {
    expect(() => loadConfig({ SESSION_SECRET: 'short' })).toThrow(
      /DATABASE_URL[\s\S]*SESSION_SECRET/,
    );
  });

  it('enforces secure settings in production', () => {
    expect(() => loadConfig({ ...baseEnv, NODE_ENV: 'production' })).toThrow(/COOKIE_SECURE/);
    expect(() =>
      loadConfig({
        ...baseEnv,
        NODE_ENV: 'production',
        COOKIE_SECURE: 'true',
        SESSION_SECRET: 'replace-with-a-long-random-string-of-32',
      }),
    ).toThrow(/placeholder/);
    expect(() => loadConfig({ ...baseEnv, NODE_ENV: 'production', COOKIE_SECURE: 'true' })).toThrow(
      /ALLOWED_ORIGINS/,
    );
  });
});

describe('pagination', () => {
  it('normalizes invalid input and caps the size', () => {
    expect(normalizePage(undefined, undefined)).toEqual({ page: 1, pageSize: 12 });
    expect(normalizePage(-2, 0, 20)).toEqual({ page: 1, pageSize: 20 });
    expect(normalizePage(3, 500)).toEqual({ page: 3, pageSize: 50 });
  });
  it('computes total pages', () => {
    expect(buildPagination({ page: 1, pageSize: 12 }, 25).totalPages).toBe(3);
    expect(buildPagination({ page: 1, pageSize: 12 }, 0).totalPages).toBe(0);
  });
});

describe('text helpers', () => {
  it('builds keys, cleans multiline text and excerpts on word boundaries', () => {
    expect(titleKey('  Data   Structures ')).toBe('data structures');
    expect(cleanMultiline('  a  \r\n\r\nb ')).toBe('a\n\nb');
    expect(cleanMultiline('   ')).toBeNull();
    expect(excerpt('word '.repeat(100), 30)).toMatch(/^(word ){5}word…$|^[a-z ]+…$/);
    expect(excerpt('short')).toBe('short');
  });
});

describe('tokens', () => {
  it('generates distinct tokens and stable hashes', () => {
    const a = generateSessionToken();
    expect(a).not.toBe(generateSessionToken());
    expect(hashSessionToken(a)).toHaveLength(64);
    expect(deriveCsrfToken('k', a)).toBe(deriveCsrfToken('k', a));
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'ab')).toBe(false);
  });
});

describe('ReportService', () => {
  it('rejects an inverted date range and converts "to" into an inclusive day', async () => {
    let captured: unknown;
    const service = new ReportService(
      { tutorialReport: async (range) => ((captured = range), { items: [], totalItems: 0 }) },
      new AuthorizationPolicy(),
    );
    await expect(
      service.tutorialReport({ from: '2026-05-02', to: '2026-05-01' }, actor()),
    ).rejects.toMatchObject({ statusCode: 422 });
    await service.tutorialReport({ from: '2026-05-01', to: '2026-05-01' }, actor());
    expect(captured).toEqual({
      from: new Date('2026-05-01T00:00:00Z'),
      to: new Date('2026-05-02T00:00:00Z'),
    });
  });
});
