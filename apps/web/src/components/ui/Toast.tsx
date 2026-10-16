import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

type ToastTone = 'success' | 'error';
interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastApi {
  success(message: string): void;
  error(message: string): void;
}

const ToastContext = createContext<ToastApi | null>(null);
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback(
    (id: number) => setToasts((all) => all.filter((t) => t.id !== id)),
    [],
  );
  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = nextId++;
      setToasts((all) => [...all.slice(-2), { id, tone, message }]);
      window.setTimeout(() => dismiss(id), tone === 'error' ? 7000 : 4000);
    },
    [dismiss],
  );
  const api = useMemo<ToastApi>(
    () => ({ success: (m) => push('success', m), error: (m) => push('error', m) }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-relevant="additions"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm animate-rise-in items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-[var(--shadow-overlay)] ring-1',
              toast.tone === 'success'
                ? 'bg-surface text-ink ring-line'
                : 'bg-danger-50 text-danger-700 ring-danger-50',
            )}
          >
            {toast.tone === 'success' ? (
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-success-700"
                aria-hidden="true"
              />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            <p className="flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded text-ink-subtle hover:text-ink"
              aria-label="Dismiss notification"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
