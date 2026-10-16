import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  /** Hidden below the md breakpoint to keep small screens readable. */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  busy?: boolean;
}

/** Semantic table with a visually hidden caption; scrolls horizontally inside its card on narrow screens. */
export function DataTable<T>({ caption, columns, rows, rowKey, busy }: DataTableProps<T>) {
  return (
    <div className={cn('overflow-x-auto rounded-[var(--radius-card)] bg-surface ring-1 ring-line transition-opacity', busy && 'opacity-60')} aria-busy={busy}>
      <table className="w-full min-w-[36rem] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-line bg-canvas/70 text-xs font-bold tracking-wide text-ink-muted uppercase">
          <tr>
            {columns.map((c) => (
              <th key={c.header} scope="col" className={cn('px-4 py-3', c.hideOnMobile && 'hidden md:table-cell', c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-canvas/60">
              {columns.map((c) => (
                <td key={c.header} className={cn('px-4 py-3 align-middle', c.hideOnMobile && 'hidden md:table-cell', c.className)}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
