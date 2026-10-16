import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import type { Permission } from '@mytutor/contracts';
import { ShieldAlert } from 'lucide-react';
import { EmptyState, LoadingState, ButtonLink } from '../../components/ui';
import { useSession } from './session';

/** Usability guard only — the API enforces authorization independently. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useSession();
  const location = useLocation();
  if (isLoading) return <LoadingState label="Checking your session…" className="min-h-[60vh]" />;
  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
    );
  }
  return <>{children}</>;
}

export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission;
  children: ReactNode;
}) {
  const { can } = useSession();
  if (!can(permission)) {
    return (
      <EmptyState
        icon={<ShieldAlert className="size-6" />}
        title="You don’t have access to this page"
        description="Your account role does not include this area. Contact an administrator if you need access."
        action={
          <ButtonLink to="/admin" variant="secondary">
            Back to dashboard
          </ButtonLink>
        }
      />
    );
  }
  return <>{children}</>;
}
