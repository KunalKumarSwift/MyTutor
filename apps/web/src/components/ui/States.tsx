import type { ReactNode } from 'react';
import { AlertTriangle, SearchX } from 'lucide-react';
import { ApiError } from '../../lib/api';
import { cn } from '../../lib/cn';
import { Button } from './Button';
import { Spinner } from './Spinner';

export function LoadingState({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cn('flex items-center justify-center gap-3 py-16 text-ink-muted', className)}>
      <Spinner className="size-5 text-brand-600" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-full bg-brand-50 text-brand-700" aria-hidden="true">
        {icon ?? <SearchX className="size-6" />}
      </div>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {description && <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = 'Something went wrong' }: { error: unknown; onRetry?: () => void; title?: string }) {
  const message = error instanceof ApiError ? error.message : 'An unexpected error occurred.';
  return (
    <div role="alert" className="flex flex-col items-center rounded-[var(--radius-card)] border border-danger-50 bg-danger-50 px-6 py-12 text-center">
      <AlertTriangle className="mb-3 size-8 text-danger-700" aria-hidden="true" />
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-ink-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Placeholder blocks that reserve layout space while content loads (prevents layout shift). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-line', className)} aria-hidden="true" />;
}
