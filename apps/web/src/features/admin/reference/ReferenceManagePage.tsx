import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { RecordStatus } from '@mytutor/contracts';
import {
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  Field,
  FormDialog,
  LoadingState,
  PageHeader,
  Pagination,
  RadioGroup,
  Select,
  StatusBadge,
  TextArea,
  TextInput,
  useToast,
  type Column,
} from '../../../components/ui';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { ApiError } from '../../../lib/api';
import { pluralize } from '../../../lib/format';
import {
  useDeleteReference,
  useReferenceList,
  useSaveReference,
  type ReferenceDto,
  type ReferenceKind,
} from '../api';
import { SearchBox } from '../SearchBox';
import { useListParams } from '../useListParams';

interface Copy {
  title: string;
  singular: string;
  description: string;
}

const COPY: Record<ReferenceKind, Copy> = {
  categories: {
    title: 'Categories',
    singular: 'category',
    description:
      'Group tutorials by subject. Inactive categories and their tutorials are hidden from the public.',
  },
  'difficulty-levels': {
    title: 'Difficulty levels',
    singular: 'difficulty level',
    description:
      'Rate tutorials by difficulty. Sort order controls how levels are listed (lowest first).',
  },
};

interface FormState {
  id: number | null;
  title: string;
  description: string;
  status: RecordStatus;
  sortOrder: string;
}

const hasSortOrder = (r: ReferenceDto): r is ReferenceDto & { sortOrder: number } =>
  'sortOrder' in r;

export default function ReferenceManagePage({ kind }: { kind: ReferenceKind }) {
  const copy = COPY[kind];
  const isLevel = kind === 'difficulty-levels';
  useDocumentTitle(copy.title);
  const toast = useToast();
  const { values, set } = useListParams();
  const list = useReferenceList(kind, {
    search: values.search || undefined,
    status: values.status,
    page: values.page,
    pageSize: 20,
  });
  const save = useSaveReference(kind);
  const remove = useDeleteReference(kind);

  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ReferenceDto | null>(null);

  const openForm = (record?: ReferenceDto) => {
    setErrors({});
    setFormError(null);
    setForm(
      record
        ? {
            id: record.id,
            title: record.title,
            description: record.description ?? '',
            status: record.status,
            sortOrder: String(hasSortOrder(record) ? record.sortOrder : 0),
          }
        : { id: null, title: '', description: '', status: 'ACTIVE', sortOrder: '0' },
    );
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    const next: Record<string, string> = {};
    if (!form.title.trim()) next['title'] = 'Title is required.';
    if (form.title.length > 100) next['title'] = 'Title must be 100 characters or fewer.';
    if (form.description.length > 1000)
      next['description'] = 'Description must be 1,000 characters or fewer.';
    const sortOrder = Number(form.sortOrder);
    if (isLevel && (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 1000))
      next['sortOrder'] = 'Enter a whole number from 0 to 1000.';
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      await save.mutateAsync({
        id: form.id,
        input: {
          title: form.title.trim(),
          description: form.description.trim() || null,
          status: form.status,
          ...(isLevel ? { sortOrder } : {}),
        },
      });
      toast.success(
        form.id === null
          ? `Created ${copy.singular} “${form.title.trim()}”.`
          : `Updated ${copy.singular}.`,
      );
      setForm(null);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors());
        setFormError(error.details.length ? null : error.message);
      } else setFormError('Could not save. Please try again.');
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await remove.mutateAsync(pendingDelete.id);
      toast.success(`Deleted “${pendingDelete.title}”.`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not delete.');
    } finally {
      setPendingDelete(null);
    }
  }

  const columns: Column<ReferenceDto>[] = [
    {
      header: 'Title',
      cell: (r) => (
        <div>
          <p className="font-semibold">{r.title}</p>
          {r.description && <p className="line-clamp-1 text-xs text-ink-subtle">{r.description}</p>}
        </div>
      ),
    },
    ...(isLevel
      ? [
          {
            header: 'Order',
            cell: (r: ReferenceDto) => (hasSortOrder(r) ? r.sortOrder : '—'),
            hideOnMobile: true,
          },
        ]
      : []),
    { header: 'Tutorials', cell: (r) => r.tutorialCount, hideOnMobile: true },
    { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (r) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openForm(r)}
            aria-label={`Edit ${r.title}`}
            icon={<Pencil className="size-4" aria-hidden="true" />}
          >
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger-700 hover:bg-danger-50 hover:text-danger-700"
            onClick={() => setPendingDelete(r)}
            aria-label={`Delete ${r.title}`}
            icon={<Trash2 className="size-4" aria-hidden="true" />}
          >
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={
          <Button onClick={() => openForm()} icon={<Plus className="size-4" aria-hidden="true" />}>
            New {copy.singular}
          </Button>
        }
      />
      <div className="grid gap-4 rounded-[var(--radius-card)] bg-surface p-4 ring-1 ring-line sm:grid-cols-[2fr_1fr]">
        <SearchBox
          label="Search by title"
          value={values.search}
          onChange={(v) => set({ search: v })}
        />
        <Field label="Status">
          <Select value={values.status ?? ''} onChange={(e) => set({ status: e.target.value })}>
            <option value="">Any status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
        </Field>
      </div>

      {list.isPending ? (
        <LoadingState />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={() => void list.refetch()} />
      ) : list.data.data.length === 0 ? (
        <EmptyState
          title={`No ${copy.title.toLowerCase()} found`}
          action={<Button onClick={() => openForm()}>New {copy.singular}</Button>}
        />
      ) : (
        <>
          <DataTable
            caption={copy.title}
            busy={list.isPlaceholderData}
            rows={list.data.data}
            rowKey={(r) => r.id}
            columns={columns}
          />
          <Pagination
            pagination={list.data.pagination}
            onPageChange={(page) => set({ page }, false)}
          />
        </>
      )}

      <FormDialog
        open={form !== null}
        title={form?.id === null ? `New ${copy.singular}` : `Edit ${copy.singular}`}
        submitLabel={form?.id === null ? 'Create' : 'Save changes'}
        busy={save.isPending}
        onSubmit={(e) => void onSubmit(e)}
        onClose={() => setForm(null)}
      >
        {form && (
          <>
            {formError && (
              <p
                role="alert"
                className="rounded-lg bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700"
              >
                {formError}
              </p>
            )}
            <Field label="Title" error={errors['title']} required>
              <TextInput
                value={form.title}
                maxLength={100}
                autoFocus
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Field>
            <Field label="Description" error={errors['description']}>
              <TextArea
                rows={3}
                value={form.description}
                maxLength={1000}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
            {isLevel && (
              <Field
                label="Sort order"
                error={errors['sortOrder']}
                hint="Lower numbers are listed first."
              >
                <TextInput
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={1000}
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </Field>
            )}
            <RadioGroup<RecordStatus>
              legend="Status"
              name="status"
              value={form.status}
              onChange={(status) => setForm({ ...form, status })}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
          </>
        )}
      </FormDialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete this ${copy.singular}?`}
        confirmLabel="Delete"
        busy={remove.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      >
        {pendingDelete && pendingDelete.tutorialCount > 0 ? (
          <>
            “{pendingDelete.title}” is used by {pluralize(pendingDelete.tutorialCount, 'tutorial')},
            so it can’t be deleted. Reassign those tutorials first, or edit it and set it to
            Inactive.
          </>
        ) : (
          <>“{pendingDelete?.title}” will be permanently deleted.</>
        )}
      </ConfirmDialog>
    </div>
  );
}
