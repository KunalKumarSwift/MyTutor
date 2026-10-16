import type { ReactNode } from 'react';
import type { RecordStatus } from '@mytutor/contracts';
import { cn } from '../../lib/cn';

type Tone = 'neutral' | 'brand' | 'accent' | 'success' | 'muted';

const tones: Record<Tone, string> = {
  neutral: 'bg-canvas text-ink-muted ring-line',
  brand: 'bg-brand-50 text-brand-800 ring-brand-100',
  accent: 'bg-accent-100 text-accent-700 ring-accent-100',
  success: 'bg-success-50 text-success-700 ring-success-50',
  muted: 'bg-canvas text-ink-subtle ring-line',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Status is conveyed by text as well as colour. */
export function StatusBadge({ status }: { status: RecordStatus }) {
  return status === 'ACTIVE' ? (
    <Badge tone="success">
      <span className="size-1.5 rounded-full bg-success-700" aria-hidden="true" />
      Active
    </Badge>
  ) : (
    <Badge tone="muted">
      <span className="size-1.5 rounded-full border border-ink-subtle" aria-hidden="true" />
      Inactive
    </Badge>
  );
}
