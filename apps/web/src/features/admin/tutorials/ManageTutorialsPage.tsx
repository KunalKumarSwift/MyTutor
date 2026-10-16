import { useState } from 'react';
import { Link } from 'react-router';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { TutorialDto } from '@mytutor/contracts';
import {
  Button,
  ButtonLink,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PageHeader,
  Pagination,
  Select,
  StatusBadge,
  useToast,
} from '../../../components/ui';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { ApiError } from '../../../lib/api';
import { formatDate } from '../../../lib/format';
import { usePublicCategories, usePublicDifficultyLevels } from '../../tutorials/public-api';
import { useAdminTutorials, useDeleteTutorial } from '../api';
import { SearchBox } from '../SearchBox';
import { useListParams } from '../useListParams';

export default function ManageTutorialsPage() {
  useDocumentTitle('Manage tutorials');
  const toast = useToast();
  const { values, set } = useListParams();
  const tutorials = useAdminTutorials({
    search: values.search || undefined,
    status: values.status,
    categoryId: values.categoryId,
    difficultyLevelId: values.difficultyLevelId,
    page: values.page,
    pageSize: 20,
  });
  const categories = usePublicCategories();
  const levels = usePublicDifficultyLevels();
  const remove = useDeleteTutorial();
  const [pendingDelete, setPendingDelete] = useState<TutorialDto | null>(null);

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete.id);
      toast.success(`Deleted “${pendingDelete.title}”.`);
      setPendingDelete(null);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not delete the tutorial.');
    }
  }

  const filtered = Boolean(values.search || values.status || values.categoryId || values.difficultyLevelId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tutorials"
        description="Create, edit, publish and remove tutorials. Inactive tutorials are hidden from the public catalogue."
        actions={<ButtonLink to="/admin/tutorials/new" icon={<Plus className="size-4" aria-hidden="true" />}>New tutorial</ButtonLink>}
      />

      <div className="grid gap-4 rounded-[var(--radius-card)] bg-surface p-4 ring-1 ring-line md:grid-cols-4">
        <SearchBox label="Search title or content" value={values.search} onChange={(v) => set({ search: v })} />
        <Field label="Category">
          <Select value={values.categoryId ?? ''} onChange={(e) => set({ category: e.target.value })}>
            <option value="">All categories</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Difficulty">
          <Select value={values.difficultyLevelId ?? ''} onChange={(e) => set({ level: e.target.value })}>
            <option value="">All levels</option>
            {levels.data?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={values.status ?? ''} onChange={(e) => set({ status: e.target.value })}>
            <option value="">Any status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </Field>
      </div>

      {tutorials.isPending ? (
        <LoadingState />
      ) : tutorials.isError ? (
        <ErrorState error={tutorials.error} onRetry={() => void tutorials.refetch()} />
      ) : tutorials.data.data.length === 0 ? (
        <EmptyState
          title={filtered ? 'No tutorials match these filters' : 'No tutorials yet'}
          description={filtered ? 'Try a different search or filter.' : 'Create the first tutorial to start the catalogue.'}
          action={!filtered ? <ButtonLink to="/admin/tutorials/new">New tutorial</ButtonLink> : undefined}
        />
      ) : (
        <>
          <DataTable
            caption="Tutorials"
            busy={tutorials.isPlaceholderData}
            rows={tutorials.data.data}
            rowKey={(t) => t.id}
            columns={[
              {
                header: 'Title',
                cell: (t) => (
                  <Link to={`/admin/tutorials/${t.id}`} className="font-semibold text-ink hover:text-brand-800">
                    {t.title}
                  </Link>
                ),
              },
              { header: 'Category', cell: (t) => t.category.title, hideOnMobile: true },
              { header: 'Level', cell: (t) => t.difficultyLevel.title, hideOnMobile: true },
              { header: 'Status', cell: (t) => <StatusBadge status={t.status} /> },
              { header: 'Created', cell: (t) => <time dateTime={t.createdAt}>{formatDate(t.createdAt)}</time>, hideOnMobile: true },
              {
                header: 'Actions',
                className: 'text-right',
                cell: (t) => (
                  <div className="flex justify-end gap-1">
                    <ButtonLink to={`/admin/tutorials/${t.id}`} variant="ghost" size="sm" icon={<Pencil className="size-4" aria-hidden="true" />} aria-label={`Edit ${t.title}`}>
                      <span className="hidden sm:inline">Edit</span>
                    </ButtonLink>
                    <Button variant="ghost" size="sm" className="text-danger-700 hover:bg-danger-50 hover:text-danger-700" onClick={() => setPendingDelete(t)} aria-label={`Delete ${t.title}`} icon={<Trash2 className="size-4" aria-hidden="true" />}>
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                ),
              },
            ]}
          />
          <Pagination pagination={tutorials.data.pagination} onPageChange={(page) => set({ page }, false)} label="Tutorial list pages" />
        </>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this tutorial?"
        confirmLabel="Delete tutorial"
        busy={remove.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      >
        “{pendingDelete?.title}” will be permanently removed and cannot be restored. To hide it from the public without
        deleting it, edit it and set its status to Inactive instead.
      </ConfirmDialog>
    </div>
  );
}
