import type {
  CategoryDto,
  DifficultyLevelDto,
  PublicCategoryDto,
  PublicDifficultyLevelDto,
} from '@mytutor/contracts';
import type { PublicReferenceRecord, ReferenceRecord } from './reference.types.js';

export function toCategoryDto(r: ReferenceRecord): CategoryDto {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    status: r.status,
    tutorialCount: r.tutorialCount,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export function toDifficultyLevelDto(r: ReferenceRecord): DifficultyLevelDto {
  return { ...toCategoryDto(r), sortOrder: r.sortOrder };
}

export function toPublicCategoryDto(r: PublicReferenceRecord): PublicCategoryDto {
  return { id: r.id, title: r.title, description: r.description, tutorialCount: r.publicTutorialCount };
}

export function toPublicDifficultyLevelDto(r: PublicReferenceRecord): PublicDifficultyLevelDto {
  return { id: r.id, title: r.title, description: r.description, sortOrder: r.sortOrder };
}
