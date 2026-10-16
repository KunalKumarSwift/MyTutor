import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '../../lib/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-semibold transition-[background-color,box-shadow,color,transform] duration-[var(--duration-fast)] disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-px select-none whitespace-nowrap';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white shadow-sm hover:bg-brand-800',
  secondary: 'bg-surface text-ink ring-1 ring-line-strong hover:bg-brand-50 hover:ring-brand-200',
  ghost: 'text-ink-muted hover:bg-brand-50 hover:text-ink',
  danger: 'bg-danger-700 text-white shadow-sm hover:bg-danger-600',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export const buttonClasses = (
  variant: Variant = 'primary',
  size: Size = 'md',
  className?: string,
) => cn(base, variants[variant], sizes[size], className);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    className,
    children,
    disabled,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner className="size-4" /> : icon}
      {children}
    </button>
  );
});

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClasses(
        variant,
        size,
        typeof className === 'string' ? className : undefined,
      )}
      {...rest}
    >
      {icon}
      {children}
    </Link>
  );
}
