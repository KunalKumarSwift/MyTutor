import type { Gender, RecordStatus, Role } from './enums.js';
import type { Permission } from './permissions.js';

// ---------- Reference data ----------

export interface CategoryDto {
  id: number;
  title: string;
  description: string | null;
  status: RecordStatus;
  tutorialCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicCategoryDto {
  id: number;
  title: string;
  description: string | null;
  tutorialCount: number;
}

export interface DifficultyLevelDto {
  id: number;
  title: string;
  description: string | null;
  sortOrder: number;
  status: RecordStatus;
  tutorialCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicDifficultyLevelDto {
  id: number;
  title: string;
  description: string | null;
  sortOrder: number;
}

export interface ReferenceInput {
  title: string;
  description?: string | null;
  status?: RecordStatus;
}

export interface DifficultyLevelInput extends ReferenceInput {
  sortOrder?: number;
}

// ---------- Tutorials ----------

export interface ReferenceSummary {
  id: number;
  title: string;
}

export interface PublicTutorialSummaryDto {
  id: number;
  title: string;
  prerequisites: string | null;
  excerpt: string;
  category: ReferenceSummary;
  difficultyLevel: ReferenceSummary & { sortOrder: number };
  createdAt: string;
}

export interface PublicTutorialDto extends Omit<PublicTutorialSummaryDto, 'excerpt'> {
  description: string;
  updatedAt: string;
}

export interface TutorialDto {
  id: number;
  title: string;
  description: string;
  prerequisites: string | null;
  status: RecordStatus;
  category: ReferenceSummary & { status: RecordStatus };
  difficultyLevel: ReferenceSummary & { status: RecordStatus };
  author: { id: number; username: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTutorialInput {
  title: string;
  description: string;
  prerequisites?: string | null;
  categoryId: number;
  difficultyLevelId: number;
  status?: RecordStatus;
}

export interface UpdateTutorialInput {
  title?: string;
  description?: string;
  prerequisites?: string | null;
  categoryId?: number;
  difficultyLevelId?: number;
  status?: RecordStatus;
  /** Optimistic-concurrency guard: the `updatedAt` value the editor loaded. */
  expectedUpdatedAt?: string;
}

// ---------- Auth & users ----------

export interface PrincipalDto {
  id: number;
  username: string;
  name: string;
  role: Role;
  permissions: Permission[];
}

export interface SessionDto {
  user: PrincipalDto;
  csrfToken: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileDto {
  id: number;
  username: string;
  role: Role;
  name: string;
  email: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  address: string | null;
  mobile: string | null;
}

export interface UpdateProfileInput {
  name: string;
  email: string;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  address?: string | null;
  mobile?: string | null;
}

export interface UserDto extends ProfileDto {
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput extends UpdateProfileInput {
  username: string;
  password: string;
  status?: RecordStatus;
}

export interface UpdateUserInput extends Partial<UpdateProfileInput> {
  status?: RecordStatus;
  /** When provided, replaces the user's password and revokes their sessions. */
  password?: string;
}

// ---------- Reports & dashboard ----------

export interface TutorialReportRowDto {
  tutorialId: number;
  tutorialTitle: string;
  tutorialStatus: RecordStatus;
  author: { id: number; username: string; name: string };
  category: string;
  difficultyLevel: string;
  createdAt: string;
}

export interface DashboardDto {
  tutorials: { total: number; active: number; inactive: number };
  categories: number;
  difficultyLevels: number;
  users: number | null;
  recentTutorials: Array<{ id: number; title: string; status: RecordStatus; createdAt: string }>;
  recentActivity: AuditEventDto[];
}

export interface AuditEventDto {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  actor: { id: number; username: string } | null;
  createdAt: string;
}
