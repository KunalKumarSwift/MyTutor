import { Link } from 'react-router';
import { Pencil, Plus } from 'lucide-react';
import type { UserDto } from '@mytutor/contracts';
import { Button, ButtonLink, DataTable, EmptyState, ErrorState, LoadingState, PageHeader, Pagination, StatusBadge, useToast } from '../../../components/ui';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { ApiError } from '../../../lib/api';
import { useSession } from '../../auth/session';
import { useSaveUser, useUsers } from '../api';
import { SearchBox } from '../SearchBox';
import { useListParams } from '../useListParams';

export default function ManageUsersPage() {
  useDocumentTitle('Users');
  const toast = useToast();
  const { user: me } = useSession();
  const { values, set } = useListParams();
  const users = useUsers({ search: values.search || undefined, page: values.page, pageSize: 20 });
  const save = useSaveUser();

  async function toggle(user: UserDto) {
    const status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await save.mutateAsync({ id: user.id, input: { status } });
      toast.success(`${user.name} is now ${status === 'ACTIVE' ? 'active' : 'inactive'}.`);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not change the status.');
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Operator accounts that can manage the catalogue. Deactivating an account signs it out immediately."
        actions={<ButtonLink to="/admin/users/new" icon={<Plus className="size-4" aria-hidden="true" />}>New operator</ButtonLink>}
      />
      <div className="rounded-[var(--radius-card)] bg-surface p-4 ring-1 ring-line sm:max-w-md">
        <SearchBox label="Search by name or user ID" value={values.search} onChange={(v) => set({ search: v })} />
      </div>
      {users.isPending ? (
        <LoadingState />
      ) : users.isError ? (
        <ErrorState error={users.error} onRetry={() => void users.refetch()} />
      ) : users.data.data.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <>
          <DataTable
            caption="Users"
            busy={users.isPlaceholderData}
            rows={users.data.data}
            rowKey={(u) => u.id}
            columns={[
              {
                header: 'Name',
                cell: (u) => (
                  <div>
                    <Link to={`/admin/users/${u.id}`} className="font-semibold hover:text-brand-800">
                      {u.name}
                    </Link>
                    <p className="font-mono text-xs text-ink-subtle">{u.username}</p>
                  </div>
                ),
              },
              { header: 'Role', cell: (u) => (u.role === 'ADMIN' ? 'Administrator' : 'Operator'), hideOnMobile: true },
              { header: 'Email', cell: (u) => u.email ?? '—', hideOnMobile: true },
              { header: 'Mobile', cell: (u) => u.mobile ?? '—', hideOnMobile: true },
              {
                header: 'Status',
                cell: (u) => (
                  <div className="flex items-center gap-2">
                    <StatusBadge status={u.status} />
                    {u.id !== me?.id && (
                      <Button variant="ghost" size="sm" onClick={() => void toggle(u)} disabled={save.isPending} aria-label={`${u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} ${u.name}`}>
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                  </div>
                ),
              },
              {
                header: 'Actions',
                className: 'text-right',
                cell: (u) => (
                  <ButtonLink to={`/admin/users/${u.id}`} variant="ghost" size="sm" icon={<Pencil className="size-4" aria-hidden="true" />} aria-label={`Edit ${u.name}`}>
                    <span className="hidden sm:inline">Edit</span>
                  </ButtonLink>
                ),
              },
            ]}
          />
          <Pagination pagination={users.data.pagination} onPageChange={(page) => set({ page }, false)} />
        </>
      )}
    </div>
  );
}
