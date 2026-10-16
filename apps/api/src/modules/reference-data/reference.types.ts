import type { RecordStatus } from '@mytutor/contracts';
import type { Page, PageRequest } from '../../shared/http/pagination.js';

/** Common shape of categories and difficulty levels (legacy tblcategory / tbldifficultylevel). */
export interface ReferenceRecord {
  id: number;
  title: string;
  description: string | null;
  status: RecordStatus;
  sortOrder: number;
  /** Number of tutorials (any status) using this record. */
  tutorialCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicReferenceRecord {
  id: number;
  title: string;
  description: string | null;
  sortOrder: number;
  /** Number of publicly visible tutorials using this record. */
  publicTutorialCount: number;
}

export interface ReferenceWrite {
  title: string;
  titleKey: string;
  description: string | null;
  status: RecordStatus;
  sortOrder: number;
}

export interface ReferenceListFilter {
  search?: string;
  status?: RecordStatus;
}

export interface ReferenceRepository {
  list(filter: ReferenceListFilter, page: PageRequest): Promise<Page<ReferenceRecord>>;
  /** Active records only, for public filters and pickers. */
  listActive(): Promise<PublicReferenceRecord[]>;
  findById(id: number): Promise<ReferenceRecord | null>;
  findByTitleKey(titleKey: string): Promise<ReferenceRecord | null>;
  create(data: ReferenceWrite): Promise<ReferenceRecord>;
  update(id: number, data: Partial<ReferenceWrite>): Promise<ReferenceRecord>;
  delete(id: number): Promise<void>;
  count(): Promise<number>;
}

export interface ReferenceKind {
  /** Human label, e.g. "Category". */
  label: string;
  /** Audit entity type, e.g. "category". */
  entityType: string;
}
