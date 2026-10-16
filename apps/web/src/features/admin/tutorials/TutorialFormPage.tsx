import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { CreateTutorialInput, RecordStatus, TutorialDto } from '@mytutor/contracts';
import {
  Button,
  ButtonLink,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PageHeader,
  RadioGroup,
  Select,
  TextArea,
  TextInput,
  useToast,
} from '../../../components/ui';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useUnsavedChanges } from '../../../hooks/useUnsavedChanges';
import { ApiError } from '../../../lib/api';
import { formatDateTime } from '../../../lib/format';
import { usePublicCategories, usePublicDifficultyLevels } from '../../tutorials/public-api';
import { useAdminTutorial, useSaveTutorial } from '../api';

interface FormValues {
  title: string;
  categoryId: string;
  difficultyLevelId: string;
  prerequisites: string;
  description: string;
  status: RecordStatus;
}

const EMPTY: FormValues = { title: '', categoryId: '', difficultyLevelId: '', prerequisites: '', description: '', status: 'ACTIVE' };

const fromTutorial = (t: TutorialDto): FormValues => ({
  title: t.title,
  categoryId: String(t.category.id),
  difficultyLevelId: String(t.difficultyLevel.id),
  prerequisites: t.prerequisites ?? '',
  description: t.description,
  status: t.status,
});

export function validateTutorial(values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.title.trim()) errors['title'] = 'Title is required.';
  else if (values.title.trim().length > 200) errors['title'] = 'Title must be 200 characters or fewer.';
  if (!values.categoryId) errors['categoryId'] = 'Choose a category.';
  if (!values.difficultyLevelId) errors['difficultyLevelId'] = 'Choose a difficulty level.';
  if (!values.description.trim()) errors['description'] = 'Description is required.';
  else if (values.description.length > 20_000) errors['description'] = 'Description must be 20,000 characters or fewer.';
  if (values.prerequisites.length > 2000) errors['prerequisites'] = 'Prerequisites must be 2,000 characters or fewer.';
  return errors;
}

export default function TutorialFormPage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const isEdit = id !== null;
  useDocumentTitle(isEdit ? 'Edit tutorial' : 'New tutorial');

  const navigate = useNavigate();
  const toast = useToast();
  const existing = useAdminTutorial(isEdit && Number.isInteger(id) ? id : null);
  const categories = usePublicCategories();
  const levels = usePublicDifficultyLevels();
  const save = useSaveTutorial();

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [baseline, setBaseline] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existing.data) {
      setValues(fromTutorial(existing.data));
      setBaseline(fromTutorial(existing.data));
    }
  }, [existing.data]);

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(baseline), [values, baseline]);
  const blocker = useUnsavedChanges(dirty && !save.isPending);

  // Options are active records, plus the currently assigned one if it has since been deactivated.
  const categoryOptions = useMemo(() => {
    const list = (categories.data ?? []).map((c) => ({ id: c.id, title: c.title }));
    const current = existing.data?.category;
    if (current && !list.some((c) => c.id === current.id)) list.push({ id: current.id, title: `${current.title} (inactive)` });
    return list;
  }, [categories.data, existing.data]);
  const levelOptions = useMemo(() => {
    const list = (levels.data ?? []).map((l) => ({ id: l.id, title: l.title }));
    const current = existing.data?.difficultyLevel;
    if (current && !list.some((l) => l.id === current.id)) list.push({ id: current.id, title: `${current.title} (inactive)` });
    return list;
  }, [levels.data, existing.data]);

  const setField = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  async function submit(event: FormEvent, addAnother: boolean) {
    event.preventDefault();
    setFormError(null);
    const clientErrors = validateTutorial(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      document.getElementById(`field-${Object.keys(clientErrors)[0]}`)?.focus();
      return;
    }
    const input: CreateTutorialInput = {
      title: values.title.trim(),
      description: values.description,
      prerequisites: values.prerequisites.trim() || null,
      categoryId: Number(values.categoryId),
      difficultyLevelId: Number(values.difficultyLevelId),
      status: values.status,
    };
    try {
      const saved = await save.mutateAsync({
        id,
        input: isEdit ? { ...input, ...(existing.data ? { expectedUpdatedAt: existing.data.updatedAt } : {}) } : input,
      });
      toast.success(isEdit ? 'Tutorial updated.' : `Created “${saved.title}”.`);
      setBaseline(values);
      if (addAnother) {
        setValues({ ...EMPTY, categoryId: values.categoryId, difficultyLevelId: values.difficultyLevelId });
        setBaseline({ ...EMPTY, categoryId: values.categoryId, difficultyLevelId: values.difficultyLevelId });
        titleRef.current?.focus();
      } else {
        // Defer so the blocker sees the clean state before navigating.
        queueMicrotask(() => navigate('/admin/tutorials'));
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors());
        setFormError(error.message);
      } else {
        setFormError('Could not save the tutorial. Please try again.');
      }
    }
  }

  if (isEdit && (!Number.isInteger(id) || (existing.error instanceof ApiError && existing.error.status === 404))) {
    return <EmptyState title="Tutorial not found" description="It may have been deleted." action={<ButtonLink to="/admin/tutorials">Back to tutorials</ButtonLink>} />;
  }
  if (isEdit && existing.isError) return <ErrorState error={existing.error} onRetry={() => void existing.refetch()} />;
  if (isEdit && existing.isPending) return <LoadingState />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit tutorial' : 'New tutorial'}
        description={isEdit ? `Last updated ${formatDateTime(existing.data!.updatedAt)} · created by ${existing.data!.author.name}` : 'Add a tutorial to the catalogue.'}
      />
      <form noValidate onSubmit={(e) => void submit(e, false)} className="space-y-6 rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-line sm:p-8">
        {formError && (
          <div role="alert" className="rounded-lg bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700">
            {formError}
            {error409Hint(save.error)}
          </div>
        )}
        <Field label="Tutorial title" error={errors['title']} required>
          <TextInput id="field-title" ref={titleRef} value={values.title} maxLength={200} onChange={(e) => setField('title', e.target.value)} />
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Category" error={errors['categoryId']} required>
            <Select id="field-categoryId" value={values.categoryId} onChange={(e) => setField('categoryId', e.target.value)}>
              <option value="">Select a category</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Difficulty level" error={errors['difficultyLevelId']} required>
            <Select id="field-difficultyLevelId" value={values.difficultyLevelId} onChange={(e) => setField('difficultyLevelId', e.target.value)}>
              <option value="">Select a level</option>
              {levelOptions.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Prerequisites" error={errors['prerequisites']} hint="What learners should know first. Optional.">
          <TextArea id="field-prerequisites" rows={3} value={values.prerequisites} maxLength={2000} onChange={(e) => setField('prerequisites', e.target.value)} />
        </Field>
        <Field label="Description" error={errors['description']} required hint="Plain text. Leave a blank line between paragraphs.">
          <TextArea id="field-description" rows={12} value={values.description} onChange={(e) => setField('description', e.target.value)} />
        </Field>
        <RadioGroup<RecordStatus>
          legend="Status"
          name="status"
          value={values.status}
          onChange={(v) => setField('status', v)}
          options={[
            { value: 'ACTIVE', label: 'Active — visible to the public' },
            { value: 'INACTIVE', label: 'Inactive — hidden' },
          ]}
          error={errors['status']}
        />
        <div className="flex flex-col-reverse gap-2 border-t border-line pt-6 sm:flex-row sm:justify-end">
          <ButtonLink to="/admin/tutorials" variant="ghost">
            Cancel
          </ButtonLink>
          {!isEdit && (
            <Button variant="secondary" disabled={save.isPending} onClick={(e) => void submit(e, true)}>
              Save &amp; add another
            </Button>
          )}
          <Button type="submit" loading={save.isPending}>
            {isEdit ? 'Save changes' : 'Create tutorial'}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title="Discard unsaved changes?"
        confirmLabel="Discard changes"
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      >
        You have edits that haven’t been saved. If you leave now they will be lost.
      </ConfirmDialog>
    </div>
  );
}

function error409Hint(error: unknown) {
  return error instanceof ApiError && error.code === 'STALE_RECORD' ? (
    <button type="button" className="ml-2 underline" onClick={() => window.location.reload()}>
      Reload latest version
    </button>
  ) : null;
}
