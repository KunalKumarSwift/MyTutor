import { createBrowserRouter, type RouteObject } from 'react-router';
import type { Permission } from '@mytutor/contracts';
import { LoadingState } from '../components/ui';
import { RequireAuth, RequirePermission } from '../features/auth/guards';
import HomePage from '../features/home/HomePage';
import { PublicLayout } from '../layouts/PublicLayout';
import NotFoundPage from '../layouts/NotFoundPage';
import { RouteErrorBoundary } from './RouteErrorBoundary';

/** Wraps a lazily loaded page in a permission check (UI only; the API enforces access). */
const guarded =
  (permission: Permission, load: () => Promise<{ default: React.ComponentType }>) => async () => {
    const { default: Page } = await load();
    return {
      Component: () => (
        <RequirePermission permission={permission}>
          <Page />
        </RequirePermission>
      ),
    };
  };

const publicRoutes: RouteObject[] = [
  { index: true, Component: HomePage },
  {
    path: 'tutorials',
    lazy: () => import('../features/tutorials/CatalogPage').then((m) => ({ Component: m.default })),
  },
  {
    path: 'tutorials/:id',
    lazy: () =>
      import('../features/tutorials/TutorialDetailPage').then((m) => ({ Component: m.default })),
  },
  {
    path: 'login',
    lazy: () => import('../features/auth/LoginPage').then((m) => ({ Component: m.default })),
  },
  { path: '*', Component: NotFoundPage },
];

const adminRoutes: RouteObject[] = [
  {
    index: true,
    lazy: guarded('tutorials:manage', () => import('../features/admin/DashboardPage')),
  },
  {
    path: 'tutorials',
    lazy: guarded(
      'tutorials:manage',
      () => import('../features/admin/tutorials/ManageTutorialsPage'),
    ),
  },
  {
    path: 'tutorials/new',
    lazy: guarded('tutorials:manage', () => import('../features/admin/tutorials/TutorialFormPage')),
  },
  {
    path: 'tutorials/:id',
    lazy: guarded('tutorials:manage', () => import('../features/admin/tutorials/TutorialFormPage')),
  },
  {
    path: 'categories',
    lazy: guarded('categories:manage', () =>
      import('../features/admin/reference/ReferenceManagePage').then((m) => ({
        default: () => <m.default kind="categories" />,
      })),
    ),
  },
  {
    path: 'difficulty-levels',
    lazy: guarded('difficultyLevels:manage', () =>
      import('../features/admin/reference/ReferenceManagePage').then((m) => ({
        default: () => <m.default kind="difficulty-levels" />,
      })),
    ),
  },
  {
    path: 'users',
    lazy: guarded('users:manage', () => import('../features/admin/users/ManageUsersPage')),
  },
  {
    path: 'users/new',
    lazy: guarded('users:manage', () => import('../features/admin/users/UserFormPage')),
  },
  {
    path: 'users/:id',
    lazy: guarded('users:manage', () => import('../features/admin/users/UserFormPage')),
  },
  {
    path: 'reports',
    lazy: guarded('reports:view', () => import('../features/admin/reports/TutorialReportPage')),
  },
  {
    path: 'profile',
    lazy: guarded('profile:manage', () => import('../features/admin/account/ProfilePage')),
  },
  {
    path: 'password',
    lazy: guarded('profile:manage', () => import('../features/admin/account/ChangePasswordPage')),
  },
  { path: '*', Component: NotFoundPage },
];

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: PublicLayout,
    ErrorBoundary: RouteErrorBoundary,
    HydrateFallback: () => <LoadingState />,
    children: publicRoutes,
  },
  {
    path: '/admin',
    ErrorBoundary: RouteErrorBoundary,
    HydrateFallback: () => <LoadingState />,
    lazy: () =>
      import('../features/admin/AdminLayout').then((m) => ({
        Component: () => (
          <RequireAuth>
            <m.default />
          </RequireAuth>
        ),
      })),
    children: adminRoutes,
  },
];

export const createRouter = () => createBrowserRouter(routes);
