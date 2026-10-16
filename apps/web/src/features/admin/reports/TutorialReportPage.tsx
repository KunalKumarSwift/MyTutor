import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router';
import { Button, DataTable, EmptyState, ErrorState, Field, LoadingState, PageHeader, Pagination, StatusBadge, TextInput } from '../../../components/ui';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { formatDate, pluralize } from '../../../lib/format';
import { useTutorialReport } from '../api';

const isDate = (v: string | null): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** Legacy "Tutorial Report": tutorials with author, category and level, filtered by creation date. */
export default function TutorialReportPage() {
  useDocumentTitle('Tutorial report');
  const [params, setParams] = useSearchParams();
  const from = isDate(params.get('from')) ? params.get('from')! : undefined;
  const to = isDate(params.get('to')) ? params.get('to')! : undefined;
  const page = Number(params.get('page')) || 1;
  const [range, setRange] = useState({ from: from ?? '', to: to ?? '' });
  const [error, setError] = useState<string | null>(null);
  const report = useTutorialReport({ from, to, page });

  function apply(e: FormEvent) {
    e.preventDefault();
    if (range.from && range.to && range.from > range.to) {
      setError('“To” must be on or after “From”.');
      return;
    }
    setError(null);
    const next = new URLSearchParams();
    if (range.from) next.set('from', range.from);
    if (range.to) next.set('to', range.to);
    setParams(next, { replace: true });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tutorial report" description="Tutorials with their author, category and difficulty level, optionally limited to a creation-date range." />
      <form onSubmit={apply} noValidate className="grid items-end gap-4 rounded-[var(--radius-card)] bg-surface p-4 ring-1 ring-line sm:grid-cols-[1fr_1fr_auto_auto]">
        <Field label="From" error={undefined}>
          <TextInput type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
        </Field>
        <Field label="To" error={error ?? undefined}>
          <TextInput type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
        </Field>
        <Button type="submit">Apply</Button>
        <Button
          variant="ghost"
          onClick={() => {
            setRange({ from: '', to: '' });
            setError(null);
            setParams(new URLSearchParams(), { replace: true });
          }}
        >
          Reset
        </Button>
      </form>
      {report.isPending ? (
        <LoadingState />
      ) : report.isError ? (
        <ErrorState error={report.error} onRetry={() => void report.refetch()} />
      ) : report.data.data.length === 0 ? (
        <EmptyState title="No tutorials in this range" description="Try widening the date range." />
      ) : (
        <>
          <p className="text-sm text-ink-muted" aria-live="polite">
            {pluralize(report.data.pagination.totalItems, 'tutorial')}
            {from || to ? ` created${from ? ` from ${from}` : ''}${to ? ` to ${to}` : ''}` : ''}
          </p>
          <DataTable
            caption="Tutorial report"
            busy={report.isPlaceholderData}
            rows={report.data.data}
            rowKey={(r) => r.tutorialId}
            columns={[
              { header: 'Tutorial', cell: (r) => <span className="font-semibold">{r.tutorialTitle}</span> },
              {
                header: 'Author',
                cell: (r) => (
                  <div>
                    <p>{r.author.name}</p>
                    <p className="font-mono text-xs text-ink-subtle">{r.author.username}</p>
                  </div>
                ),
              },
              { header: 'Category', cell: (r) => r.category, hideOnMobile: true },
              { header: 'Level', cell: (r) => r.difficultyLevel, hideOnMobile: true },
              { header: 'Status', cell: (r) => <StatusBadge status={r.tutorialStatus} />, hideOnMobile: true },
              { header: 'Created', cell: (r) => <time dateTime={r.createdAt}>{formatDate(r.createdAt)}</time> },
            ]}
          />
          <Pagination
            pagination={report.data.pagination}
            onPageChange={(p) => {
              const next = new URLSearchParams(params);
              next.set('page', String(p));
              setParams(next, { replace: true });
            }}
          />
        </>
      )}
    </div>
  );
}
