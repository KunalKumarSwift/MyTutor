import { Prisma } from '../../generated/prisma/client.js';
import { AppError } from '../../shared/errors/app-error.js';

/**
 * Converts known Prisma constraint failures into safe application errors.
 * Repositories call this so services never see ORM-specific exceptions.
 */
export function mapPrismaError(error: unknown, entity: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new AppError('CONFLICT', 409, `A ${entity.toLowerCase()} with these details already exists.`);
      case 'P2003':
        throw new AppError('IN_USE', 409, `This ${entity.toLowerCase()} is referenced by other records.`);
      case 'P2025':
        throw new AppError('NOT_FOUND', 404, `${entity} not found.`);
    }
  }
  throw error;
}
