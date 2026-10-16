import type { Pagination as PaginationData } from '@mytutor/contracts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  label?: string;
}

export function Pagination({ pagination, onPageChange, label = 'Pagination' }: PaginationProps) {
  const { page, totalPages, totalItems, pageSize } = pagination;
  if (totalPages <= 1) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, totalItems);

  return (
    <nav
      aria-label={label}
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-sm text-ink-muted" aria-live="polite">
        Showing <span className="font-semibold text-ink">{first}</span>–
        <span className="font-semibold text-ink">{last}</span> of{' '}
        <span className="font-semibold text-ink">{totalItems}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          icon={<ChevronLeft className="size-4" aria-hidden="true" />}
        >
          Previous
        </Button>
        <span className="px-2 text-sm text-ink-muted">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
