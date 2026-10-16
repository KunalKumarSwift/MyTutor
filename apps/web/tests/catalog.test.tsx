import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import CatalogPage from '../src/features/tutorials/CatalogPage';
import { mockApi, page, renderRoutes, tutorialSummary } from './test-utils';

const reference = (url: URL) => {
  if (url.pathname === '/api/v1/categories')
    return { body: { data: [{ id: 1, title: 'Databases', description: null, tutorialCount: 2 }] } };
  if (url.pathname === '/api/v1/difficulty-levels')
    return { body: { data: [{ id: 1, title: 'Beginner', description: null, sortOrder: 1 }] } };
  return undefined;
};

describe('CatalogPage', () => {
  it('renders tutorials from the API as accessible links', async () => {
    mockApi(
      (url) =>
        reference(url) ??
        (url.pathname === '/api/v1/tutorials'
          ? { body: page([tutorialSummary(1, 'Joins Explained'), tutorialSummary(2, 'Indexes')]) }
          : undefined),
    );
    renderRoutes([{ path: '/tutorials', Component: CatalogPage }], ['/tutorials']);

    const link = await screen.findByRole('link', { name: 'Joins Explained' });
    expect(link).toHaveAttribute('href', '/tutorials/1');
    expect(screen.getByText('2 tutorials available')).toBeInTheDocument();
    expect(screen.getByText('Basic algebra')).toBeInTheDocument();
  });

  it('applies the category filter through the URL and requests filtered data', async () => {
    const { calls } = mockApi(
      (url) =>
        reference(url) ??
        (url.pathname === '/api/v1/tutorials'
          ? { body: page([tutorialSummary(1, 'Joins Explained')]) }
          : undefined),
    );
    const { router } = renderRoutes(
      [{ path: '/tutorials', Component: CatalogPage }],
      ['/tutorials'],
    );
    await screen.findByRole('link', { name: 'Joins Explained' });

    await screen.findByRole('option', { name: 'Databases' });
    await userEvent.selectOptions(screen.getByLabelText('Category'), '1');

    await waitFor(() => expect(router.state.location.search).toBe('?category=1'));
    await waitFor(() =>
      expect(
        calls.some(
          (c) =>
            c.url.pathname === '/api/v1/tutorials' && c.url.searchParams.get('categoryId') === '1',
        ),
      ).toBe(true),
    );
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });

  it('shows an empty state with a way out when nothing matches', async () => {
    mockApi(
      (url) =>
        reference(url) ?? (url.pathname === '/api/v1/tutorials' ? { body: page([]) } : undefined),
    );
    renderRoutes([{ path: '/tutorials', Component: CatalogPage }], ['/tutorials?search=zzz']);
    expect(await screen.findByRole('heading', { name: 'No tutorials found' })).toBeInTheDocument();
    const empty = screen.getByRole('heading', { name: 'No tutorials found' }).parentElement!;
    expect(within(empty).getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });

  it('shows an error state with a working retry', async () => {
    let fail = true;
    mockApi((url) => {
      const ref = reference(url);
      if (ref) return ref;
      if (url.pathname !== '/api/v1/tutorials') return undefined;
      return fail
        ? {
            status: 500,
            body: {
              error: {
                code: 'INTERNAL_ERROR',
                message: 'Server exploded politely',
                requestId: 'r',
              },
            },
          }
        : { body: page([tutorialSummary(3, 'Recovered')]) };
    });
    renderRoutes([{ path: '/tutorials', Component: CatalogPage }], ['/tutorials']);
    expect(await screen.findByText('Server exploded politely')).toBeInTheDocument();
    fail = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('link', { name: 'Recovered' })).toBeInTheDocument();
  });
});
