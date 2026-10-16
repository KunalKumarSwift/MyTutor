import type { Gender, RecordStatus, Role } from '@mytutor/contracts';
import type { Page, PageRequest } from '../../shared/http/pagination.js';

export interface UserRecord {
  id: number;
  username: string;
  passwordHash: string;
  role: Role;
  status: RecordStatus;
  name: string;
  email: string | null;
  /** ISO calendar date (YYYY-MM-DD). */
  dateOfBirth: string | null;
  gender: Gender | null;
  address: string | null;
  mobile: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileFields {
  name: string;
  email: string | null;
  dateOfBirth: string | null;
  gender: Gender | null;
  address: string | null;
  mobile: string | null;
}

export interface NewUser extends ProfileFields {
  username: string;
  passwordHash: string;
  role: Role;
  status: RecordStatus;
}

export type UserPatch = Partial<ProfileFields & { passwordHash: string; status: RecordStatus }>;

export interface UserListFilter {
  search?: string;
}

export interface UserRepository {
  findById(id: number): Promise<UserRecord | null>;
  findByUsername(username: string): Promise<UserRecord | null>;
  list(filter: UserListFilter, page: PageRequest): Promise<Page<UserRecord>>;
  create(user: NewUser): Promise<UserRecord>;
  update(id: number, patch: UserPatch): Promise<UserRecord>;
  count(): Promise<number>;
}
