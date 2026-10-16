import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import { vi } from 'vitest';
import { ToastProvider } from '../src/components/ui';
import { SessionProvider } from '../src/features/auth/session';

type Handler = (url: URL, init: RequestInit) => { status?: number; body?: unknown } | undefined;

/** Stubs fetch with a tiny router. Unmatched calls fail loudly so tests never hit the network. */
export function mockApi(handler: Handler) {
  const calls: Array<{ url: URL; init: RequestInit }> = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(String(input), 'http://localhost');
    calls.push({ url, init });
    const result =
      url.pathname === '/api/v1/auth/session' && !handler(url, init) ? { body: { data: null } } : handler(url, init);
    if (!result) throw new Error(`Unhandled request: ${init.method ?? 'GET'} ${url.pathname}${url.search}`);
    const status = result.status ?? 200;
    return new Response(status === 204 ? null : JSON.stringify(result.body ?? {}), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  return { calls, fetchMock };
}

export function renderRoutes(routes: RouteObject[], initialEntries: string[] = ['/']) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const router = createMemoryRouter(routes, { initialEntries });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </SessionProvider>
    </QueryClientProvider>,
  );
  return { ...utils, router, queryClient };
}

export const page = <T,>(data: T[], overrides: Partial<{ page: number; pageSize: number; totalItems: number; totalPages: number }> = {}) => ({
  data,
  pagination: { page: 1, pageSize: 12, totalItems: data.length, totalPages: data.length ? 1 : 0, ...overrides },
});

export const tutorialSummary = (id: number, title: string) => ({
  id,
  title,
  prerequisites: id % 2 ? 'Basic algebra' : null,
  excerpt: `${title} excerpt`,
  category: { id: 1, title: 'Databases' },
  difficultyLevel: { id: 1, title: 'Beginner', sortOrder: 1 },
  createdAt: '2026-05-01T10:00:00.000Z',
});
