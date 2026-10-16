import type { RecordStatus } from '@mytutor/contracts';
import type { Page, PageRequest } from '../../shared/http/pagination.js';

export interface TutorialReportRow {
  tutorialId: number;
  tutorialTitle: string;
  tutorialStatus: RecordStatus;
  author: { id: number; username: string; name: string };
  category: string;
  difficultyLevel: string;
  createdAt: Date;
}

export interface ReportRange {
  /** Inclusive lower bound. */
  from?: Date;
  /** Exclusive upper bound. */
  to?: Date;
}

export interface ReportRepository {
  tutorialReport(range: ReportRange, page: PageRequest): Promise<Page<TutorialReportRow>>;
}
