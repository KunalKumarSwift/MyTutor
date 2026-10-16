import {
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '../../lib/cn';

const control =
  'block w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-subtle shadow-xs transition-[border-color,box-shadow] duration-[var(--duration-fast)] focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-100 disabled:bg-canvas aria-[invalid=true]:border-danger-600 aria-[invalid=true]:focus:ring-danger-50';

interface FieldProps {
  label: string;
  error?: string | undefined;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactElement<{
    id?: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
    required?: boolean;
  }>;
  labelAction?: ReactNode;
}

/** Associates a label, hint and error message with a single form control. */
export function Field({
  label,
  error,
  hint,
  required,
  className,
  children,
  labelAction,
}: FieldProps) {
  const generatedId = useId();
  const id = children.props.id ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
          {required && (
            <span className="text-danger-700" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
        {labelAction}
      </div>
      {isValidElement(children) &&
        cloneElement(children, {
          id,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedBy,
          required,
        } as never)}
      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm font-medium text-danger-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Decorative icon shown inside the field. The label still targets the <input> itself. */
  leadingIcon?: ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className, leadingIcon, ...props },
  ref,
) {
  const input = (
    <input
      ref={ref}
      className={cn(control, 'h-10', leadingIcon ? 'pl-9' : undefined, className)}
      {...props}
    />
  );
  if (!leadingIcon) return input;
  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-subtle [&>svg]:size-4"
        aria-hidden="true"
      >
        {leadingIcon}
      </span>
      {input}
    </div>
  );
});

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea({ className, ...props }, ref) {
  return (
    <textarea ref={ref} className={cn(control, 'py-2 leading-relaxed', className)} {...props} />
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cn(control, 'h-10 pr-8', className)} {...props}>
        {children}
      </select>
    );
  },
);

interface RadioGroupProps<T extends string> {
  legend: string;
  name: string;
  value: T | null;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  error?: string | undefined;
}

export function RadioGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
  error,
}: RadioGroupProps<T>) {
  const id = useId();
  return (
    <fieldset className="space-y-1.5" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="text-sm font-semibold text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-control)] border border-line-strong bg-surface px-3 py-2 text-sm has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-brand-100"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="size-4 accent-brand-700"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-danger-700" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
