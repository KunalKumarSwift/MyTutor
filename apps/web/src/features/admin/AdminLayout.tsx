import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import type { Permission } from '@mytutor/contracts';
import {
  BarChart3,
  BookOpen,
  ExternalLink,
  FolderTree,
  Gauge,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import { useToast } from '../../components/ui';
import { cn } from '../../lib/cn';
import { Brand } from '../../layouts/PublicLayout';
import { useSession } from '../auth/session';

interface NavItem {
  to: string;
  label: string;
  icon: typeof BookOpen;
  permission: Permission;
  end?: boolean;
}

const NAV: Array<{ heading: string; items: NavItem[] }> = [
  {
    heading: 'Catalogue',
    items: [
      {
        to: '/admin',
        label: 'Dashboard',
        icon: LayoutDashboard,
        permission: 'tutorials:manage',
        end: true,
      },
      {
        to: '/admin/tutorials',
        label: 'Tutorials',
        icon: BookOpen,
        permission: 'tutorials:manage',
      },
      {
        to: '/admin/categories',
        label: 'Categories',
        icon: FolderTree,
        permission: 'categories:manage',
      },
      {
        to: '/admin/difficulty-levels',
        label: 'Difficulty levels',
        icon: Gauge,
        permission: 'difficultyLevels:manage',
      },
      {
        to: '/admin/reports',
        label: 'Tutorial report',
        icon: BarChart3,
        permission: 'reports:view',
      },
    ],
  },
  {
    heading: 'People',
    items: [{ to: '/admin/users', label: 'Users', icon: Users, permission: 'users:manage' }],
  },
  {
    heading: 'Account',
    items: [
      { to: '/admin/profile', label: 'My profile', icon: UserCircle, permission: 'profile:manage' },
      {
        to: '/admin/password',
        label: 'Change password',
        icon: KeyRound,
        permission: 'profile:manage',
      },
    ],
  },
];

export default function AdminLayout() {
  const { user, can, logout } = useSession();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  async function signOut() {
    setSigningOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      toast.error('Signed out locally, but the server could not be reached.');
      navigate('/login', { replace: true });
    }
  }

  const sidebar = (
    <nav aria-label="Administration" className="flex flex-col gap-6">
      {NAV.map((group) => {
        const items = group.items.filter((i) => can(i.permission));
        if (items.length === 0) return null;
        return (
          <div key={group.heading}>
            <p className="px-3 text-xs font-bold tracking-wider text-ink-subtle uppercase">
              {group.heading}
            </p>
            <ul className="mt-2 space-y-0.5">
              {items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end ?? false}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                        isActive
                          ? 'bg-brand-50 text-brand-800'
                          : 'text-ink-muted hover:bg-canvas hover:text-ink',
                      )
                    }
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <a href="#admin-main" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid size-10 place-items-center rounded-lg text-ink-muted hover:bg-canvas lg:hidden"
              aria-expanded={open}
              aria-controls="admin-sidebar"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">{open ? 'Close navigation' : 'Open navigation'}</span>
              {open ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
            <Brand />
            <span className="hidden rounded-md bg-canvas px-2 py-0.5 text-xs font-bold text-ink-muted ring-1 ring-line sm:inline">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <NavLink
              to="/"
              className="hidden items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink md:inline-flex"
            >
              View site <ExternalLink className="size-3.5" aria-hidden="true" />
            </NavLink>
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-tight font-bold">{user?.name}</p>
              <p className="text-xs text-ink-subtle">
                {user?.role === 'ADMIN' ? 'Administrator' : 'Operator'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              disabled={signingOut}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-ink-muted ring-1 ring-line hover:bg-canvas hover:text-ink disabled:opacity-60"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside
          id="admin-sidebar"
          className={cn(
            'fixed inset-y-16 left-0 z-20 w-64 overflow-y-auto border-r border-line bg-surface p-4 lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)]',
            open ? 'block' : 'hidden',
          )}
        >
          {sidebar}
        </aside>
        {open && (
          <div
            className="fixed inset-0 top-16 z-10 bg-ink/30 lg:hidden"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
        )}
        <main id="admin-main" className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
