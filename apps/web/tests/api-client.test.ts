import { describe, expect, it, vi } from 'vitest';
import { ApiError, api, setCsrfToken, setUnauthenticatedHandler, toQueryString } from '../src/lib/api';
import { mockApi } from './test-utils';

describe('api client', () => {
  it('builds query strings without empty values', () => {
    expect(toQueryString({ a: 1, b: '', c: undefined, d: null, e: 'x y' })).toBe('?a=1&e=x+y');
    expect(toQueryString({})).toBe('');
  });

  it('sends the CSRF token on mutations only', async () => {
    const { calls } = mockApi(() => ({ body: { data: true } }));
    setCsrfToken('token-123');
    await api.get('/tutorials');
    await api.post('/admin/categories', { title: 'x' });
    const [get, post] = calls;
    expect((get!.init.headers as Record<string, string>)['x-csrf-token']).toBeUndefined();
    expect((post!.init.headers as Record<string, string>)['x-csrf-token']).toBe('token-123');
    expect(post!.init.credentials).toBe('same-origin');
    setCsrfToken(null);
  });

  it('turns error envelopes into ApiError with field details', async () => {
    mockApi(() => ({
      status: 422,
      body: { error: { code: 'VALIDATION_ERROR', message: 'Bad input', details: [{ field: 'title', message: 'Required' }], requestId: 'r1' } },
    }));
    const error = await api.post('/admin/tutorials', {}).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 422, code: 'VALIDATION_ERROR', message: 'Bad input', requestId: 'r1' });
    expect((error as ApiError).fieldErrors()).toEqual({ title: 'Required' });
  });

  it('notifies the session layer on 401 and reports network failures clearly', async () => {
    const onUnauthenticated = vi.fn();
    setUnauthenticatedHandler(onUnauthenticated);
    mockApi(() => ({ status: 401, body: { error: { code: 'UNAUTHENTICATED', message: 'Sign in', requestId: 'x' } } }));
    await expect(api.get('/admin/tutorials')).rejects.toMatchObject({ status: 401 });
    expect(onUnauthenticated).toHaveBeenCalledOnce();
    setUnauthenticatedHandler(null);

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(api.get('/tutorials')).rejects.toMatchObject({ code: 'NETWORK_ERROR', status: 0 });
  });
});
