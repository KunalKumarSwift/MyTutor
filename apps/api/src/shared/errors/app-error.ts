import type { ErrorCode, ErrorDetail } from '@mytutor/contracts';

/** An expected failure with a stable code and a message that is safe to show clients. */
export class AppError extends Error {
  override name = 'AppError';

  constructor(
    readonly code: ErrorCode,
    readonly statusCode: number,
    message: string,
    readonly details?: ErrorDetail[],
  ) {
    super(message);
  }
}

export const notFound = (entity: string) => new AppError('NOT_FOUND', 404, `${entity} not found.`);

export const conflict = (message: string, details?: ErrorDetail[]) =>
  new AppError('CONFLICT', 409, message, details);

/** Semantically invalid input (well-formed, but e.g. references a record that does not exist). */
export const invalid = (details: ErrorDetail[], message = 'The request contains invalid fields.') =>
  new AppError('VALIDATION_ERROR', 422, message, details);

export const unauthenticated = () =>
  new AppError('UNAUTHENTICATED', 401, 'You must be signed in to do that.');

export const forbidden = () =>
  new AppError('FORBIDDEN', 403, 'You do not have permission to perform this action.');
