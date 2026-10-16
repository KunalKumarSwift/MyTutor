import { useState, type FormEvent } from 'react';
import { Button, Field, PageHeader, TextInput, useToast } from '../../../components/ui';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { ApiError } from '../../../lib/api';
import { useSession } from '../../auth/session';
import { useChangePassword } from '../api';

export default function ChangePasswordPage() {
  useDocumentTitle('Change password');
  const toast = useToast();
  const { user } = useSession();
  const change = useChangePassword();
  const [values, setValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!values.currentPassword) next['currentPassword'] = 'Enter your current password.';
    if (values.newPassword.length < 8) next['newPassword'] = 'Use at least 8 characters.';
    if (values.newPassword.length > 128) next['newPassword'] = 'Use at most 128 characters.';
    if (values.confirmPassword !== values.newPassword)
      next['confirmPassword'] = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length) return;
    try {
      await change.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setValues({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed. Other devices have been signed out.');
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors());
      else toast.error('Could not change your password.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Change password"
        description="Choose a new password. Other signed-in devices will be signed out."
      />
      <form
        noValidate
        onSubmit={(e) => void onSubmit(e)}
        className="max-w-lg space-y-5 rounded-[var(--radius-card)] bg-surface p-5 ring-1 ring-line sm:p-8"
      >
        {/* Helps password managers associate the new password with the right account. */}
        <input
          type="text"
          name="username"
          autoComplete="username"
          value={user?.username ?? ''}
          readOnly
          hidden
        />
        <Field label="Current password" error={errors['currentPassword']} required>
          <TextInput
            type="password"
            autoComplete="current-password"
            value={values.currentPassword}
            onChange={(e) => setValues({ ...values, currentPassword: e.target.value })}
          />
        </Field>
        <Field
          label="New password"
          error={errors['newPassword']}
          hint="At least 8 characters."
          required
        >
          <TextInput
            type="password"
            autoComplete="new-password"
            value={values.newPassword}
            onChange={(e) => setValues({ ...values, newPassword: e.target.value })}
          />
        </Field>
        <Field label="Confirm new password" error={errors['confirmPassword']} required>
          <TextInput
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(e) => setValues({ ...values, confirmPassword: e.target.value })}
          />
        </Field>
        <div className="flex justify-end border-t border-line pt-6">
          <Button type="submit" loading={change.isPending}>
            Update password
          </Button>
        </div>
      </form>
    </div>
  );
}
