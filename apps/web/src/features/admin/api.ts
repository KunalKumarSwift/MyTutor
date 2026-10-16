import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CategoryDto,
  ChangePasswordInput,
  CreateTutorialInput,
  CreateUserInput,
  DashboardDto,
  DataResponse,
  DifficultyLevelDto,
  DifficultyLevelInput,
  PaginatedResponse,
  ProfileDto,
  RecordStatus,
  TutorialDto,
  TutorialReportRowDto,
  UpdateProfileInput,
  UpdateTutorialInput,
  UpdateUserInput,
  UserDto,
} from '@mytutor/contracts';
import { api } from '../../lib/api';

/** All admin cache keys start with 'admin' so signing out can drop them in one go. */
const keys = {
  dashboard: ['admin', 'dashboard'] as const,
  tutorials: ['admin', 'tutorials'] as const,
  tutorial: (id: number) => ['admin', 'tutorial', id] as const,
  reference: (kind: ReferenceKind) => ['admin', kind] as const,
  users: ['admin', 'users'] as const,
  user: (id: number) => ['admin', 'user', id] as const,
  profile: ['admin', 'profile'] as const,
  report: ['admin', 'report'] as const,
};

export interface ListParams {
  search?: string;
  status?: RecordStatus;
  page?: number;
  pageSize?: number;
}

const unwrap = <T,>(r: DataResponse<T>) => r.data;

// ----- Dashboard -----
export const useDashboard = () =>
  useQuery({ queryKey: keys.dashboard, queryFn: ({ signal }) => api.get<DataResponse<DashboardDto>>('/admin/dashboard', undefined, signal).then(unwrap) });

// ----- Tutorials -----
export interface TutorialListParams extends ListParams {
  categoryId?: number;
  difficultyLevelId?: number;
}

export const useAdminTutorials = (params: TutorialListParams) =>
  useQuery({
    queryKey: [...keys.tutorials, params],
    queryFn: ({ signal }) => api.get<PaginatedResponse<TutorialDto>>('/admin/tutorials', { ...params }, signal),
    placeholderData: keepPreviousData,
  });

export const useAdminTutorial = (id: number | null) =>
  useQuery({
    queryKey: keys.tutorial(id ?? 0),
    queryFn: ({ signal }) => api.get<DataResponse<TutorialDto>>(`/admin/tutorials/${id}`, undefined, signal).then(unwrap),
    enabled: id !== null,
    staleTime: 0,
  });

function useInvalidateCatalogue() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ['admin'] }),
      qc.invalidateQueries({ queryKey: ['public'] }),
    ]);
}

export function useSaveTutorial() {
  const invalidate = useInvalidateCatalogue();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | null; input: CreateTutorialInput | UpdateTutorialInput }) =>
      (id === null
        ? api.post<DataResponse<TutorialDto>>('/admin/tutorials', input)
        : api.patch<DataResponse<TutorialDto>>(`/admin/tutorials/${id}`, input)
      ).then(unwrap),
    onSuccess: invalidate,
  });
}

export function useDeleteTutorial() {
  const invalidate = useInvalidateCatalogue();
  return useMutation({ mutationFn: (id: number) => api.delete(`/admin/tutorials/${id}`), onSuccess: invalidate });
}

// ----- Categories & difficulty levels -----
export type ReferenceKind = 'categories' | 'difficulty-levels';
export type ReferenceDto = CategoryDto | DifficultyLevelDto;

export const useReferenceList = (kind: ReferenceKind, params: ListParams) =>
  useQuery({
    queryKey: [...keys.reference(kind), params],
    queryFn: ({ signal }) => api.get<PaginatedResponse<ReferenceDto>>(`/admin/${kind}`, { ...params }, signal),
    placeholderData: keepPreviousData,
  });

export function useSaveReference(kind: ReferenceKind) {
  const invalidate = useInvalidateCatalogue();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | null; input: Partial<DifficultyLevelInput> }) =>
      (id === null
        ? api.post<DataResponse<ReferenceDto>>(`/admin/${kind}`, input)
        : api.patch<DataResponse<ReferenceDto>>(`/admin/${kind}/${id}`, input)
      ).then(unwrap),
    onSuccess: invalidate,
  });
}

export function useDeleteReference(kind: ReferenceKind) {
  const invalidate = useInvalidateCatalogue();
  return useMutation({ mutationFn: (id: number) => api.delete(`/admin/${kind}/${id}`), onSuccess: invalidate });
}

// ----- Users -----
export const useUsers = (params: ListParams) =>
  useQuery({
    queryKey: [...keys.users, params],
    queryFn: ({ signal }) => api.get<PaginatedResponse<UserDto>>('/admin/users', { ...params }, signal),
    placeholderData: keepPreviousData,
  });

export const useUser = (id: number | null) =>
  useQuery({
    queryKey: keys.user(id ?? 0),
    queryFn: ({ signal }) => api.get<DataResponse<UserDto>>(`/admin/users/${id}`, undefined, signal).then(unwrap),
    enabled: id !== null,
    staleTime: 0,
  });

export function useSaveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | null; input: CreateUserInput | UpdateUserInput }) =>
      (id === null
        ? api.post<DataResponse<UserDto>>('/admin/users', input)
        : api.patch<DataResponse<UserDto>>(`/admin/users/${id}`, input)
      ).then(unwrap),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin'] }),
  });
}

// ----- Account -----
export const useProfile = () =>
  useQuery({ queryKey: keys.profile, queryFn: ({ signal }) => api.get<DataResponse<ProfileDto>>('/profile', undefined, signal).then(unwrap), staleTime: 0 });

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.put<DataResponse<ProfileDto>>('/profile', input).then(unwrap),
    onSuccess: (profile) => {
      qc.setQueryData(keys.profile, profile);
      return qc.invalidateQueries({ queryKey: ['session'] });
    },
  });
}

export const useChangePassword = () =>
  useMutation({ mutationFn: (input: ChangePasswordInput) => api.post<void>('/auth/password', input) });

// ----- Reports -----
export interface ReportParams {
  from?: string;
  to?: string;
  page?: number;
}

export const useTutorialReport = (params: ReportParams) =>
  useQuery({
    queryKey: [...keys.report, params],
    queryFn: ({ signal }) => api.get<PaginatedResponse<TutorialReportRowDto>>('/admin/reports/tutorials', { ...params, pageSize: 25 }, signal),
    placeholderData: keepPreviousData,
  });
