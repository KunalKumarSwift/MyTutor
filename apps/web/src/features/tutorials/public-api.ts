import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
  DataResponse,
  PaginatedResponse,
  PublicCategoryDto,
  PublicDifficultyLevelDto,
  PublicTutorialDto,
  PublicTutorialSummaryDto,
} from '@mytutor/contracts';
import { api } from '../../lib/api';

export interface CatalogFilters {
  search?: string;
  categoryId?: number;
  difficultyLevelId?: number;
  sort?: 'newest' | 'oldest' | 'title';
  page?: number;
  pageSize?: number;
}

export function usePublicTutorials(filters: CatalogFilters) {
  return useQuery({
    queryKey: ['public', 'tutorials', filters],
    // The signal cancels superseded requests while the user is still typing or paging.
    queryFn: ({ signal }) => api.get<PaginatedResponse<PublicTutorialSummaryDto>>('/tutorials', { ...filters }, signal),
    placeholderData: keepPreviousData,
  });
}

export function usePublicTutorial(id: number) {
  return useQuery({
    queryKey: ['public', 'tutorial', id],
    queryFn: ({ signal }) => api.get<DataResponse<PublicTutorialDto>>(`/tutorials/${id}`, undefined, signal).then((r) => r.data),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function usePublicCategories() {
  return useQuery({
    queryKey: ['public', 'categories'],
    queryFn: ({ signal }) => api.get<DataResponse<PublicCategoryDto[]>>('/categories', undefined, signal).then((r) => r.data),
    staleTime: 5 * 60_000,
  });
}

export function usePublicDifficultyLevels() {
  return useQuery({
    queryKey: ['public', 'difficulty-levels'],
    queryFn: ({ signal }) =>
      api.get<DataResponse<PublicDifficultyLevelDto[]>>('/difficulty-levels', undefined, signal).then((r) => r.data),
    staleTime: 5 * 60_000,
  });
}
