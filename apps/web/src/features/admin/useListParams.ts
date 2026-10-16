import { useSearchParams } from 'react-router';
import type { RecordStatus } from '@mytutor/contracts';

const positiveInt = (v: string | null) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : undefined;
};

/** Keeps list filters in the URL so they survive navigation into a record and back. */
export function useListParams() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status');
  const values = {
    search: params.get('search') ?? '',
    status: status === 'ACTIVE' || status === 'INACTIVE' ? (status as RecordStatus) : undefined,
    page: positiveInt(params.get('page')) ?? 1,
    categoryId: positiveInt(params.get('category')),
    difficultyLevelId: positiveInt(params.get('level')),
  };
  const set = (changes: Record<string, string | number | undefined>, resetPage = true) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v === undefined || v === '') next.delete(k);
      else next.set(k, String(v));
    }
    if (resetPage) next.delete('page');
    setParams(next, { replace: true });
  };
  return { values, set, params };
}
