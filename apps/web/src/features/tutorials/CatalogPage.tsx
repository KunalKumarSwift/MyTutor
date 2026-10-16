import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Search, X } from 'lucide-react';
import {
  Button,
  EmptyState,
  ErrorState,
  Field,
  PageHeader,
  Pagination,
  Select,
  TextInput,
} from '../../components/ui';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { pluralize } from '../../lib/format';
import {
  usePublicCategories,
  usePublicDifficultyLevels,
  usePublicTutorials,
  type CatalogFilters,
} from './public-api';
import { TutorialGrid, TutorialGridSkeleton } from './TutorialCard';

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'Title A–Z' },
] as const;

const toId = (value: string | null) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
};

export function readFilters(params: URLSearchParams): CatalogFilters {
  const sort = params.get('sort');
  return {
    search: params.get('search') ?? undefined,
    categoryId: toId(params.get('category')),
    difficultyLevelId: toId(params.get('level')),
    sort: SORTS.some((s) => s.value === sort) ? (sort as CatalogFilters['sort']) : undefined,
    page: toId(params.get('page')),
    pageSize: 12,
  };
}

export default function CatalogPage() {
  useDocumentTitle('Tutorials');
  const [params, setParams] = useSearchParams();
  const filters = readFilters(params);
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);

  const categories = usePublicCategories();
  const levels = usePublicDifficultyLevels();
  const tutorials = usePublicTutorials(filters);

  const update = (changes: Record<string, string | undefined>, resetPage = true) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (resetPage) next.delete('page');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if ((filters.search ?? '') !== debouncedSearch)
      update({ search: debouncedSearch || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced value
  }, [debouncedSearch]);

  const hasFilters = Boolean(filters.search || filters.categoryId || filters.difficultyLevelId);
  const clearFilters = () => {
    setSearchInput('');
    setParams(new URLSearchParams(), { replace: true });
  };

  return (
    <div className="mx-auto max-w-[var(--container-page)] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeader
        title="Tutorials"
        description="Browse the catalogue by category and difficulty level, or search by keyword."
      />

      <section
        aria-label="Filter tutorials"
        className="mt-8 rounded-[var(--radius-card)] bg-surface p-4 shadow-[var(--shadow-card)] ring-1 ring-line sm:p-5"
      >
        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="grid gap-4 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]"
        >
          <Field label="Search">
            <TextInput
              type="search"
              leadingIcon={<Search />}
              placeholder="e.g. databases, loops…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              maxLength={100}
            />
          </Field>
          <Field label="Category">
            <Select
              value={filters.categoryId ?? ''}
              onChange={(e) => update({ category: e.target.value || undefined })}
            >
              <option value="">All categories</option>
              {categories.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Difficulty">
            <Select
              value={filters.difficultyLevelId ?? ''}
              onChange={(e) => update({ level: e.target.value || undefined })}
            >
              <option value="">All levels</option>
              {levels.data?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Sort by">
            <Select
              value={filters.sort ?? 'newest'}
              onChange={(e) =>
                update({ sort: e.target.value === 'newest' ? undefined : e.target.value })
              }
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
        </form>
      </section>

      <div className="mt-6 flex min-h-8 items-center justify-between gap-4">
        <p className="text-sm text-ink-muted" aria-live="polite">
          {tutorials.data
            ? pluralize(tutorials.data.pagination.totalItems, 'tutorial') +
              (hasFilters ? ' match your filters' : ' available')
            : ' '}
        </p>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            icon={<X className="size-4" aria-hidden="true" />}
          >
            Clear filters
          </Button>
        )}
      </div>

      <div className="mt-4" aria-busy={tutorials.isFetching}>
        <h2 className="sr-only">Results</h2>
        {tutorials.isPending ? (
          <TutorialGridSkeleton />
        ) : tutorials.isError ? (
          <ErrorState
            error={tutorials.error}
            title="We couldn’t load tutorials"
            onRetry={() => void tutorials.refetch()}
          />
        ) : tutorials.data.data.length === 0 ? (
          <EmptyState
            title="No tutorials found"
            description={
              hasFilters
                ? 'Try a different keyword or remove a filter.'
                : 'Tutorials will appear here once they are published.'
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div
            className={
              tutorials.isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'
            }
          >
            <TutorialGrid tutorials={tutorials.data.data} />
            <div className="mt-10">
              <Pagination
                label="Tutorial pages"
                pagination={tutorials.data.pagination}
                onPageChange={(page) => {
                  update({ page: page > 1 ? String(page) : undefined }, false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
