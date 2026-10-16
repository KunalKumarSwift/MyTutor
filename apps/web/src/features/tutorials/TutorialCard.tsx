import { Link } from 'react-router';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
import type { PublicTutorialSummaryDto } from '@mytutor/contracts';
import { Badge, Skeleton } from '../../components/ui';
import { useReveal } from '../../hooks/useReveal';
import { formatDate } from '../../lib/format';

const levelTone = (sortOrder: number) =>
  sortOrder <= 1 ? 'success' : sortOrder === 2 ? 'brand' : 'accent';

export function TutorialCard({
  tutorial,
  index = 0,
}: {
  tutorial: PublicTutorialSummaryDto;
  index?: number;
}) {
  const ref = useReveal<HTMLLIElement>(index);
  return (
    <li ref={ref} className="h-full">
      <article className="group relative flex h-full flex-col rounded-[var(--radius-card)] bg-surface p-6 shadow-[var(--shadow-card)] ring-1 ring-line transition-[box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out-soft)] focus-within:ring-brand-500 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">{tutorial.category.title}</Badge>
          <Badge tone={levelTone(tutorial.difficultyLevel.sortOrder)}>
            {tutorial.difficultyLevel.title}
          </Badge>
        </div>
        <h3 className="mt-4 text-lg font-bold leading-snug text-ink">
          <Link
            to={`/tutorials/${tutorial.id}`}
            className="after:absolute after:inset-0 after:rounded-[var(--radius-card)] focus:outline-none"
          >
            {tutorial.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-muted">
          {tutorial.excerpt}
        </p>
        {tutorial.prerequisites && (
          <p className="mt-3 line-clamp-1 text-xs text-ink-subtle">
            <span className="font-semibold text-ink-muted">Prerequisites:</span>{' '}
            {tutorial.prerequisites}
          </p>
        )}
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs text-ink-subtle">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            <time dateTime={tutorial.createdAt}>{formatDate(tutorial.createdAt)}</time>
          </span>
          <span
            className="inline-flex items-center gap-1 font-semibold text-brand-700 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            Read <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </article>
    </li>
  );
}

export function TutorialGrid({ tutorials }: { tutorials: PublicTutorialSummaryDto[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
      {tutorials.map((t, i) => (
        <TutorialCard key={t.id} tutorial={t} index={i} />
      ))}
    </ul>
  );
}

export function TutorialGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li
          key={i}
          className="h-[15.5rem] rounded-[var(--radius-card)] bg-surface p-6 ring-1 ring-line"
        >
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-5 h-5 w-4/5" />
          <Skeleton className="mt-3 h-3.5 w-full" />
          <Skeleton className="mt-2 h-3.5 w-11/12" />
          <Skeleton className="mt-2 h-3.5 w-2/3" />
        </li>
      ))}
    </ul>
  );
}
