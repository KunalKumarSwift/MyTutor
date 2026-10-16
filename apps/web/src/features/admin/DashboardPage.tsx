import { Link } from 'react-router';
import { BookOpen, FolderTree, Gauge, Plus, Users } from 'lucide-react';
import { ButtonLink, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatDate, formatDateTime } from '../../lib/format';
import { useSession } from '../auth/session';
import { useDashboard } from './api';

function Stat({ label, value, detail, icon: Icon, to }: { label: string; value: number; detail?: string; icon: typeof BookOpen; to: string }) {
  return (
    <Link to={to} className="group rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-line transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-muted">{label}</p>
        <Icon className="size-5 text-brand-600" aria-hidden="true" />
      </div>
      <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
      {detail && <p className="mt-1 text-xs text-ink-subtle">{detail}</p>}
    </Link>
  );
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useSession();
  const dashboard = useDashboard();

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${user?.name ?? ''}`}
        description="An overview of the tutorial catalogue."
        actions={<ButtonLink to="/admin/tutorials/new" icon={<Plus className="size-4" aria-hidden="true" />}>New tutorial</ButtonLink>}
      />
      {dashboard.isPending ? (
        <LoadingState />
      ) : dashboard.isError ? (
        <ErrorState error={dashboard.error} onRetry={() => void dashboard.refetch()} />
      ) : (
        <>
          <section aria-label="Catalogue totals" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Tutorials" value={dashboard.data.tutorials.total} detail={`${dashboard.data.tutorials.active} active · ${dashboard.data.tutorials.inactive} inactive`} icon={BookOpen} to="/admin/tutorials" />
            <Stat label="Categories" value={dashboard.data.categories} icon={FolderTree} to="/admin/categories" />
            <Stat label="Difficulty levels" value={dashboard.data.difficultyLevels} icon={Gauge} to="/admin/difficulty-levels" />
            {dashboard.data.users !== null && <Stat label="Users" value={dashboard.data.users} icon={Users} to="/admin/users" />}
          </section>
          <div className="grid gap-6 lg:grid-cols-2">
            <section aria-labelledby="recent-tutorials" className="rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-line">
              <h2 id="recent-tutorials" className="font-bold">
                Latest tutorials
              </h2>
              {dashboard.data.recentTutorials.length === 0 ? (
                <p className="mt-3 text-sm text-ink-muted">No tutorials yet.</p>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {dashboard.data.recentTutorials.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                      <Link to={`/admin/tutorials/${t.id}`} className="truncate text-sm font-semibold hover:text-brand-800">
                        {t.title}
                      </Link>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="hidden text-xs text-ink-subtle sm:inline">{formatDate(t.createdAt)}</span>
                        <StatusBadge status={t.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section aria-labelledby="recent-activity" className="rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-line">
              <h2 id="recent-activity" className="font-bold">
                Recent activity
              </h2>
              {dashboard.data.recentActivity.length === 0 ? (
                <p className="mt-3 text-sm text-ink-muted">Changes made by administrators and operators will appear here.</p>
              ) : (
                <ul className="mt-3 divide-y divide-line">
                  {dashboard.data.recentActivity.map((e) => (
                    <li key={e.id} className="py-2.5 text-sm">
                      <p className="font-medium">{e.summary}</p>
                      <p className="text-xs text-ink-subtle">
                        {e.actor ? e.actor.username : 'Former user'} · <time dateTime={e.createdAt}>{formatDateTime(e.createdAt)}</time>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
