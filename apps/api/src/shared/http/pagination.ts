import { MAX_PAGE_SIZE, type Pagination } from '@mytutor/contracts';

export interface PageRequest {
  page: number;
  pageSize: number;
}

export interface Page<T> {
  items: T[];
  totalItems: number;
}

export function normalizePage(page?: number, pageSize?: number, defaultSize = 12): PageRequest {
  const safePage = Number.isInteger(page) && page! > 0 ? page! : 1;
  const size = Number.isInteger(pageSize) && pageSize! > 0 ? pageSize! : defaultSize;
  return { page: safePage, pageSize: Math.min(size, MAX_PAGE_SIZE) };
}

export function toSkipTake({ page, pageSize }: PageRequest): { skip: number; take: number } {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

export function buildPagination(request: PageRequest, totalItems: number): Pagination {
  return {
    page: request.page,
    pageSize: request.pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / request.pageSize),
  };
}
