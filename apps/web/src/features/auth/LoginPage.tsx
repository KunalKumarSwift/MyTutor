import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { LogIn } from 'lucide-react';
import { Button, Field, TextInput } from '../../components/ui';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { ApiError } from '../../lib/api';
import { useSession } from './session';

/** Only same-app, non-protocol-relative paths are accepted as post-login destinations. */
export function safeRedirect(target: unknown): string {
  return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
    ? target
    : '/admin';
}

export default function LoginPage() {
  useDocumentTitle('Sign in');
  const { user, login } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = safeRedirect((location.state as { from?: unknown } | null)?.from);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={redirectTo} replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!username.trim()) next.username = 'Enter your user ID.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await login({ username: username.trim(), password });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setPassword('');
      setErrors({
        form: error instanceof ApiError ? error.message : 'Sign in failed. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-md flex-col justify-center px-4 py-12">
      <div className="animate-rise-in rounded-[var(--radius-card)] bg-surface p-8 shadow-[var(--shadow-card)] ring-1 ring-line">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-ink-muted">
            For administrators and operators who manage the tutorial catalogue.
          </p>
        </div>
        {errors.form && (
          <div
            role="alert"
            className="mb-5 rounded-lg bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700"
          >
            {errors.form}
          </div>
        )}
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <Field label="User ID" error={errors.username} required>
            <TextInput
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Field>
          <Field label="Password" error={errors.password} required>
            <TextInput
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={submitting}
            icon={<LogIn className="size-4" aria-hidden="true" />}
          >
            Sign in
          </Button>
        </form>
        <p className="mt-6 text-xs text-ink-subtle">
          Forgot your password? Ask an administrator to reset it from the Users screen.
        </p>
      </div>
    </div>
  );
}
