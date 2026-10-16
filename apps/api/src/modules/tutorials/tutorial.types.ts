import type { RecordStatus } from '@mytutor/contracts';
import type { Page, PageRequest } from '../../shared/http/pagination.js';

export interface TutorialRecord {
  id: number;
  title: string;
  description: string;
  prerequisites: string | null;
  status: RecordStatus;
  category: { id: number; title: string; status: RecordStatus };
  difficultyLevel: { id: number; title: string; status: RecordStatus; sortOrder: number };
  author: { id: number; username: string; name: string };
  createdAt: Date;
  updatedAt: Date;
}

export interface TutorialFilter {
  search?: string;
  categoryId?: number;
  difficultyLevelId?: number;
  status?: RecordStatus;
}

export type TutorialSort = 'newest' | 'oldest' | 'title';

export interface TutorialWrite {
  title: string;
  description: string;
  prerequisites: string | null;
  status: RecordStatus;
  categoryId: number;
  difficultyLevelId: number;
}

export interface TutorialCounts {
  total: number;
  active: number;
  inactive: number;
}

export interface TutorialRepository {
  /**
   * Publicly visible tutorials: the tutorial, its category and its difficulty level are all
   * ACTIVE. (Legacy guest pages listed every tutorial regardless of status.)
   */
  listPublic(
    filter: Omit<TutorialFilter, 'status'>,
    sort: TutorialSort,
    page: PageRequest,
  ): Promise<Page<TutorialRecord>>;
  findPublicById(id: number): Promise<TutorialRecord | null>;
  list(
    filter: TutorialFilter,
    sort: TutorialSort,
    page: PageRequest,
  ): Promise<Page<TutorialRecord>>;
  findById(id: number): Promise<TutorialRecord | null>;
  create(data: TutorialWrite & { authorId: number }): Promise<TutorialRecord>;
  /**
   * Applies a partial update. When `expectedUpdatedAt` is given the update only succeeds if
   * the record has not changed since; returns null on such a conflict.
   */
  update(
    id: number,
    data: Partial<TutorialWrite>,
    expectedUpdatedAt?: Date,
  ): Promise<TutorialRecord | null>;
  delete(id: number): Promise<void>;
  counts(): Promise<TutorialCounts>;
}
