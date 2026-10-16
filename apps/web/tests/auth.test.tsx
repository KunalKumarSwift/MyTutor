import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { RequireAuth } from '../src/features/auth/guards';
import LoginPage, { safeRedirect } from '../src/features/auth/LoginPage';
import { mockApi, renderRoutes } from './test-utils';

const principal = {
  id: 1,
  username: 'admin',
  name: 'Admin',
  role: 'ADMIN',
  permissions: ['tutorials:manage'],
};

const routes = [
  { path: '/login', Component: LoginPage },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <h1>Admin area</h1>
      </RequireAuth>
    ),
  },
];

describe('authentication UI', () => {
  it('only accepts same-app redirect targets', () => {
    expect(safeRedirect('/admin/tutorials?x=1')).toBe('/admin/tutorials?x=1');
    expect(safeRedirect('//evil.example')).toBe('/admin');
    expect(safeRedirect('https://evil.example')).toBe('/admin');
    expect(safeRedirect(undefined)).toBe('/admin');
  });

  it('redirects anonymous visitors from protected pages to login', async () => {
    mockApi(() => undefined);
    const { router } = renderRoutes(routes, ['/admin']);
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('validates required fields before calling the API', async () => {
    const { calls } = mockApi(() => undefined);
    renderRoutes(routes, ['/login']);
    await userEvent.click(await screen.findByRole('button', { name: 'Sign in' }));
    expect(screen.getByText('Enter your user ID.')).toBeInTheDocument();
    expect(screen.getByLabelText(/User ID/)).toHaveAttribute('aria-invalid', 'true');
    expect(calls.filter((c) => c.url.pathname === '/api/v1/auth/login')).toHaveLength(0);
  });

  it('shows the server message on failure and clears the password', async () => {
    mockApi((url) =>
      url.pathname === '/api/v1/auth/login'
        ? {
            status: 401,
            body: {
              error: {
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid username or password.',
                requestId: 'r',
              },
            },
          }
        : undefined,
    );
    renderRoutes(routes, ['/login']);
    await userEvent.type(await screen.findByLabelText(/User ID/), 'admin');
    await userEvent.type(screen.getByLabelText(/Password/), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password.');
    expect(screen.getByLabelText(/Password/)).toHaveValue('');
  });

  it('signs in and continues to the protected page', async () => {
    mockApi((url) =>
      url.pathname === '/api/v1/auth/login'
        ? { body: { data: { user: principal, csrfToken: 't' } } }
        : undefined,
    );
    const { router } = renderRoutes(routes, ['/admin']);
    await userEvent.type(await screen.findByLabelText(/User ID/), 'admin');
    await userEvent.type(screen.getByLabelText(/Password/), 'correct-password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('heading', { name: 'Admin area' })).toBeInTheDocument();
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin'));
  });
});
