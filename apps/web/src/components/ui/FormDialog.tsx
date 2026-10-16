import { useEffect, useId, useRef, type FormEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface FormDialogProps {
  open: boolean;
  title: string;
  submitLabel: string;
  busy?: boolean;
  onSubmit: (event: FormEvent) => void;
  onClose: () => void;
  children: ReactNode;
}

/** Modal form on the native <dialog> element (focus trap, Escape to close, inert background). */
export function FormDialog({
  open,
  title,
  submitLabel,
  busy,
  onSubmit,
  onClose,
  children,
}: FormDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
      className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-[var(--radius-card)] bg-surface p-0 text-ink shadow-[var(--shadow-overlay)] backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]"
    >
      {open && (
        <form noValidate onSubmit={onSubmit}>
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 id={titleId} className="text-lg font-bold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg p-1 text-ink-subtle hover:bg-canvas hover:text-ink"
              aria-label="Close dialog"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="space-y-5 px-6 py-5">{children}</div>
          <div className="flex flex-col-reverse gap-2 border-t border-line px-6 py-4 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" loading={busy}>
              {submitLabel}
            </Button>
          </div>
        </form>
      )}
    </dialog>
  );
}
