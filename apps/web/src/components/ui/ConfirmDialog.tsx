import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal confirmation built on the native <dialog> element: focus is trapped and restored
 * by the browser, Escape cancels, and the rest of the page is inert while open.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  tone = 'danger',
  busy,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
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
        if (!busy) onCancel();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-[var(--radius-card)] bg-surface p-0 text-ink shadow-[var(--shadow-overlay)] backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]"
    >
      {open && (
        <div className="p-6">
          <h2 id={titleId} className="text-lg font-bold">
            {title}
          </h2>
          <div className="mt-2 text-sm text-ink-muted">{children}</div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onCancel} disabled={busy} autoFocus>
              Cancel
            </Button>
            <Button variant={tone} onClick={onConfirm} loading={busy}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
