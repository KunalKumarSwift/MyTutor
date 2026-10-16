import { Link, useParams } from 'react-router';
import { ArrowLeft, CalendarDays, ListChecks, RefreshCw } from 'lucide-react';
import { Badge, ButtonLink, EmptyState, ErrorState, Skeleton } from '../../components/ui';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ApiError } from '../../lib/api';
import { formatDate, paragraphs } from '../../lib/format';
import { usePublicTutorial, usePublicTutorials } from './public-api';
import { TutorialGrid } from './TutorialCard';

export default function TutorialDetailPage() {
  const id = Number(useParams().id);
  const tutorial = usePublicTutorial(id);
  useDocumentTitle(tutorial.data?.title ?? 'Tutorial');

  const related = usePublicTutorials({ categoryId: tutorial.data?.category.id, pageSize: 4 });
  const relatedItems = tutorial.data ? (related.data?.data ?? []).filter((t) => t.id !== id).slice(0, 3) : [];

  const notFound = !Number.isInteger(id) || id <= 0 || (tutorial.error instanceof ApiError && tutorial.error.status === 404);

  return (
    <div className="mx-auto max-w-[var(--container-page)] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link to="/tutorials" className="inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand-700 hover:text-brand-900">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to tutorials
      </Link>

      {notFound ? (
        <div className="mt-8">
          <EmptyState
            title="Tutorial not found"
            description="It may have been unpublished or the link may be incorrect."
            action={<ButtonLink to="/tutorials">Browse tutorials</ButtonLink>}
          />
        </div>
      ) : tutorial.isError ? (
        <div className="mt-8">
          <ErrorState error={tutorial.error} onRetry={() => void tutorial.refetch()} />
        </div>
      ) : (
        <article className="mt-6">
          <header className="max-w-[var(--container-prose)]">
            {tutorial.data ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/tutorials?category=${tutorial.data.category.id}`} className="rounded-full">
                    <Badge tone="brand">{tutorial.data.category.title}</Badge>
                  </Link>
                  <Link to={`/tutorials?level=${tutorial.data.difficultyLevel.id}`} className="rounded-full">
                    <Badge tone="accent">{tutorial.data.difficultyLevel.title}</Badge>
                  </Link>
                </div>
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{tutorial.data.title}</h1>
                <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    <dt className="sr-only">Published</dt>
                    <dd>
                      Published <time dateTime={tutorial.data.createdAt}>{formatDate(tutorial.data.createdAt)}</time>
                    </dd>
                  </div>
                  {tutorial.data.updatedAt.slice(0, 10) !== tutorial.data.createdAt.slice(0, 10) && (
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="size-4" aria-hidden="true" />
                      <dt className="sr-only">Updated</dt>
                      <dd>
                        Updated <time dateTime={tutorial.data.updatedAt}>{formatDate(tutorial.data.updatedAt)}</time>
                      </dd>
                    </div>
                  )}
                </dl>
              </>
            ) : (
              <div aria-hidden="true">
                <Skeleton className="h-5 w-40 rounded-full" />
                <Skeleton className="mt-5 h-10 w-3/4" />
                <Skeleton className="mt-4 h-4 w-48" />
              </div>
            )}
          </header>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="max-w-[var(--container-prose)] space-y-5 text-[1.0625rem] leading-8 text-ink">
              {tutorial.data ? (
                paragraphs(tutorial.data.description).map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))
              ) : (
                <div className="space-y-3" role="status" aria-label="Loading tutorial">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Skeleton key={i} className="h-4" />
                  ))}
                </div>
              )}
            </div>
            {tutorial.data && (
              <aside className="h-fit rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-line lg:sticky lg:top-24">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink-muted">
                  <ListChecks className="size-4" aria-hidden="true" />
                  Prerequisites
                </h2>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink">
                  {tutorial.data.prerequisites ?? 'None — this tutorial is self-contained.'}
                </p>
              </aside>
            )}
          </div>
        </article>
      )}

      {relatedItems.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-16 border-t border-line pt-10">
          <h2 id="related-heading" className="text-xl font-bold">
            More in {tutorial.data?.category.title}
          </h2>
          <div className="mt-6">
            <TutorialGrid tutorials={relatedItems} />
          </div>
        </section>
      )}
    </div>
  );
}
