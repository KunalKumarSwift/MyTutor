import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { RecordStatus } from '@mytutor/contracts';
import { Button, ButtonLink, EmptyState, ErrorState, Field, LoadingState, PageHeader, RadioGroup, TextInput, useToast } from '../../../components/ui';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { ApiError } from '../../../lib/api';
import { useSession } from '../../auth/session';
import { EMPTY_PROFILE, ProfileFields, toProfileInput, validateProfile, type ProfileValues } from '../account/ProfileFields';
import { useSaveUser, useUser } from '../api';

export default function UserFormPage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : null;
  const isEdit = id !== null;
  useDocumentTitle(isEdit ? 'Edit user' : 'New operator');
  const navigate = useNavigate();
  const toast = useToast();
  const { user: me } = useSession();
  const existing = useUser(isEdit && Number.isInteger(id) ? id : null);
  const save = useSaveUser();

  const [profile, setProfile] = useState<ProfileValues>(EMPTY_PROFILE);
  const [account, setAccount] = useState({ username: '', password: '', confirmPassword: '', status: 'ACTIVE' as RecordStatus });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const u = existing.data;
    if (!u) return;
    setProfile({ name: u.name, email: u.email ?? '', dateOfBirth: u.dateOfBirth ?? '', gender: u.gender, address: u.address ?? '', mobile: u.mobile ?? '' });
    setAccount((a) => ({ ...a, username: u.username, status: u.status }));
  }, [existing.data]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validateProfile(profile);
    if (!isEdit && !/^[A-Za-z0-9._-]{3,50}$/.test(account.username)) next['username'] = 'Use 3–50 letters, digits, dots, dashes or underscores.';
    if (!isEdit || account.password) {
      if (account.password.length < 8) next['password'] = 'Use at least 8 characters.';
      if (account.password !== account.confirmPassword) next['confirmPassword'] = 'Passwords do not match.';
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    try {
      const base = { ...toProfileInput(profile), status: account.status };
      if (isEdit) {
        await save.mutateAsync({ id, input: { ...base, ...(account.password ? { password: account.password } : {}) } });
        toast.success(account.password ? 'User updated and password reset.' : 'User updated.');
      } else {
        await save.mutateAsync({ id: null, input: { ...base, username: account.username, password: account.password } });
        toast.success(`Created operator “${account.username.toLowerCase()}”.`);
      }
      navigate('/admin/users');
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors());
        if (!error.details.length) toast.error(error.message);
      } else toast.error('Could not save the user.');
    }
  }

  if (isEdit && (!Number.isInteger(id) || (existing.error instanceof ApiError && existing.error.status === 404))) {
    return <EmptyState title="User not found" action={<ButtonLink to="/admin/users">Back to users</ButtonLink>} />;
  }
  if (isEdit && existing.isError) return <ErrorState error={existing.error} onRetry={() => void existing.refetch()} />;
  if (isEdit && existing.isPending) return <LoadingState />;
  const isSelf = isEdit && id === me?.id;

  return (
    <div className="space-y-6">
      <PageHeader title={isEdit ? `Edit ${existing.data?.name}` : 'New operator'} description={isEdit ? undefined : 'Operators can manage tutorials, categories, difficulty levels and reports.'} />
      <form noValidate onSubmit={(e) => void onSubmit(e)} className="space-y-8 rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-line sm:p-8">
        <section aria-labelledby="account-heading" className="space-y-5">
          <h2 id="account-heading" className="text-lg font-bold">
            Account
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="User ID" error={errors['username']} hint={isEdit ? 'User IDs cannot be changed.' : 'Used to sign in.'} required={!isEdit}>
              <TextInput value={account.username} disabled={isEdit} autoComplete="off" autoCapitalize="none" spellCheck={false} maxLength={50} onChange={(e) => setAccount({ ...account, username: e.target.value })} />
            </Field>
            <div className="hidden sm:block" />
            <Field label={isEdit ? 'New password' : 'Password'} error={errors['password']} hint={isEdit ? 'Leave blank to keep the current password. Resetting signs the user out.' : 'At least 8 characters.'} required={!isEdit}>
              <TextInput type="password" autoComplete="new-password" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} />
            </Field>
            <Field label="Confirm password" error={errors['confirmPassword']} required={!isEdit}>
              <TextInput type="password" autoComplete="new-password" value={account.confirmPassword} onChange={(e) => setAccount({ ...account, confirmPassword: e.target.value })} />
            </Field>
          </div>
          {!isSelf && (
            <RadioGroup<RecordStatus>
              legend="Status"
              name="status"
              value={account.status}
              onChange={(status) => setAccount({ ...account, status })}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive — cannot sign in' },
              ]}
              error={errors['status']}
            />
          )}
        </section>
        <section aria-labelledby="personal-heading" className="space-y-5 border-t border-line pt-8">
          <h2 id="personal-heading" className="text-lg font-bold">
            Personal information
          </h2>
          <ProfileFields values={profile} errors={errors} onChange={setProfile} />
        </section>
        <div className="flex flex-col-reverse gap-2 border-t border-line pt-6 sm:flex-row sm:justify-end">
          <ButtonLink to="/admin/users" variant="ghost">
            Cancel
          </ButtonLink>
          <Button type="submit" loading={save.isPending}>
            {isEdit ? 'Save changes' : 'Create operator'}
          </Button>
        </div>
      </form>
    </div>
  );
}
