import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router';
import { LayoutDashboard, LogIn, Menu, X } from 'lucide-react';
import { cn } from '../lib/cn';
import { useSession } from '../features/auth/session';

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
    isActive ? 'bg-brand-50 text-brand-800' : 'text-ink-muted hover:bg-canvas hover:text-ink',
  );

export function Brand({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('inline-flex items-center gap-2 rounded-lg text-lg font-extrabold tracking-tight', className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-brand-700 text-white" aria-hidden="true">
        <svg viewBox="0 0 32 32" className="size-5">
          <path d="M8 22V10l8 6 8-6v12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>
        My<span className="text-accent-600">Tutor</span>
      </span>
    </Link>
  );
}

export function PublicLayout() {
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener('popstate', close);
    return () => window.removeEventListener('popstate', close);
  }, []);

  const links = (
    <>
      <NavLink to="/" end className={navClass} onClick={() => setOpen(false)}>
        Home
      </NavLink>
      <NavLink to="/tutorials" className={navClass} onClick={() => setOpen(false)}>
        Tutorials
      </NavLink>
      {user ? (
        <NavLink to="/admin" className={navClass} onClick={() => setOpen(false)}>
          <span className="inline-flex items-center gap-1.5">
            <LayoutDashboard className="size-4" aria-hidden="true" /> Dashboard
          </span>
        </NavLink>
      ) : (
        <NavLink to="/login" className={navClass} onClick={() => setOpen(false)}>
          <span className="inline-flex items-center gap-1.5">
            <LogIn className="size-4" aria-hidden="true" /> Sign in
          </span>
        </NavLink>
      )}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
        <div className="mx-auto flex h-16 max-w-[var(--container-page)] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />
          <nav aria-label="Main" className="hidden items-center gap-1 sm:flex">
            {links}
          </nav>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg text-ink-muted hover:bg-canvas sm:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="Main" className="flex flex-col gap-1 border-t border-line px-4 py-3 sm:hidden">
            {links}
          </nav>
        )}
      </header>
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-[var(--container-page)] flex-col gap-4 px-4 py-8 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Brand className="text-base" />
          <nav aria-label="Footer" className="flex gap-5">
            <Link to="/tutorials" className="hover:text-ink">
              Tutorials
            </Link>
            <Link to="/login" className="hover:text-ink">
              Staff sign in
            </Link>
          </nav>
          <p>Free tutorials, organised by subject and level.</p>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
