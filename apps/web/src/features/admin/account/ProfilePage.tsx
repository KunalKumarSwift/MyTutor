import { useEffect, useState, type FormEvent } from 'react';
import { Button, ErrorState, LoadingState, PageHeader, useToast } from '../../../components/ui';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { ApiError } from '../../../lib/api';
import { useProfile, useUpdateProfile } from '../api';
import { EMPTY_PROFILE, ProfileFields, toProfileInput, validateProfile, type ProfileValues } from './ProfileFields';

export default function ProfilePage() {
  useDocumentTitle('My profile');
  const toast = useToast();
  const profile = useProfile();
  const update = useUpdateProfile();
  const [values, setValues] = useState<ProfileValues>(EMPTY_PROFILE);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile.data) {
      const p = profile.data;
      setValues({ name: p.name, email: p.email ?? '', dateOfBirth: p.dateOfBirth ?? '', gender: p.gender, address: p.address ?? '', mobile: p.mobile ?? '' });
    }
  }, [profile.data]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validateProfile(values);
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      await update.mutateAsync(toProfileInput(values));
      toast.success('Profile updated.');
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors());
      toast.error(error instanceof ApiError ? error.message : 'Could not update your profile.');
    }
  }

  if (profile.isPending) return <LoadingState />;
  if (profile.isError) return <ErrorState error={profile.error} onRetry={() => void profile.refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader title="My profile" description="Your account and personal information." />
      <form noValidate onSubmit={(e) => void onSubmit(e)} className="space-y-6 rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-line sm:p-8">
        <dl className="grid gap-4 rounded-lg bg-canvas p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-ink-muted">User ID</dt>
            <dd className="mt-0.5 font-mono">{profile.data.username}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-muted">Role</dt>
            <dd className="mt-0.5">{profile.data.role === 'ADMIN' ? 'Administrator' : 'Operator'}</dd>
          </div>
        </dl>
        <ProfileFields values={values} errors={errors} onChange={setValues} />
        <div className="flex justify-end border-t border-line pt-6">
          <Button type="submit" loading={update.isPending}>
            Save profile
          </Button>
        </div>
      </form>
    </div>
  );
}
