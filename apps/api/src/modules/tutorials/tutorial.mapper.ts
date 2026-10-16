import type { PublicTutorialDto, PublicTutorialSummaryDto, TutorialDto } from '@mytutor/contracts';
import { excerpt } from '../../shared/text.js';
import type { TutorialRecord } from './tutorial.types.js';

export function toPublicTutorialSummaryDto(t: TutorialRecord): PublicTutorialSummaryDto {
  return {
    id: t.id,
    title: t.title,
    prerequisites: t.prerequisites,
    excerpt: excerpt(t.description),
    category: { id: t.category.id, title: t.category.title },
    difficultyLevel: {
      id: t.difficultyLevel.id,
      title: t.difficultyLevel.title,
      sortOrder: t.difficultyLevel.sortOrder,
    },
    createdAt: t.createdAt.toISOString(),
  };
}

export function toPublicTutorialDto(t: TutorialRecord): PublicTutorialDto {
  const { excerpt: _excerpt, ...summary } = toPublicTutorialSummaryDto(t);
  return { ...summary, description: t.description, updatedAt: t.updatedAt.toISOString() };
}

export function toTutorialDto(t: TutorialRecord): TutorialDto {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    prerequisites: t.prerequisites,
    status: t.status,
    category: { id: t.category.id, title: t.category.title, status: t.category.status },
    difficultyLevel: {
      id: t.difficultyLevel.id,
      title: t.difficultyLevel.title,
      status: t.difficultyLevel.status,
    },
    author: t.author,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}
