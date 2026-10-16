import type { ErrorDetail, ErrorResponse } from '@mytutor/contracts';
import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../shared/errors/app-error.js';

interface ValidationIssue {
  instancePath: string;
  message?: string;
  keyword: string;
  params: Record<string, unknown>;
}

function fieldName(issue: ValidationIssue): string {
  const path = issue.instancePath.replace(/^\//, '').replace(/\//g, '.');
  if (issue.keyword === 'required' && typeof issue.params['missingProperty'] === 'string') {
    return path ? `${path}.${issue.params['missingProperty']}` : issue.params['missingProperty'];
  }
  if (issue.keyword === 'additionalProperties' && typeof issue.params['additionalProperty'] === 'string') {
    return issue.params['additionalProperty'];
  }
  return path || '(request)';
}

function issueMessage(issue: ValidationIssue): string {
  switch (issue.keyword) {
    case 'required':
      return 'This field is required.';
    case 'additionalProperties':
      return 'This field is not supported.';
    case 'minLength':
      return issue.params['limit'] === 1 ? 'This field is required.' : `Must be at least ${String(issue.params['limit'])} characters.`;
    case 'maxLength':
      return `Must be at most ${String(issue.params['limit'])} characters.`;
    case 'pattern':
      return 'This field has an invalid format.';
    case 'format':
      return `Must be a valid ${String(issue.params['format'])}.`;
    default:
      return issue.message ? `Invalid value: ${issue.message}.` : 'Invalid value.';
  }
}

/** Deduplicates details per field (union schemas produce several issues for one problem). */
function toDetails(issues: ValidationIssue[]): ErrorDetail[] {
  const byField = new Map<string, string>();
  for (const issue of issues) {
    if (issue.keyword === 'anyOf' || issue.keyword === 'const') continue;
    const field = fieldName(issue);
    if (!byField.has(field)) byField.set(field, issueMessage(issue));
  }
  if (byField.size === 0 && issues[0]) byField.set(fieldName(issues[0]), 'Invalid value.');
  return [...byField].map(([field, message]) => ({ field, message }));
}

function send(reply: FastifyReply, request: FastifyRequest, status: number, body: Omit<ErrorResponse['error'], 'requestId'>) {
  const payload: ErrorResponse = { error: { ...body, requestId: String(request.id) } };
  return reply.status(status).send(payload);
}

export function registerErrorHandling(app: FastifyInstance): void {
  app.setErrorHandler((error: FastifyError | AppError, request, reply) => {
    if (error instanceof AppError) {
      if (error.statusCode === 429) reply.header('retry-after', reply.getHeader('retry-after') ?? '60');
      return send(reply, request, error.statusCode, {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      });
    }

    const fastifyError = error as FastifyError;
    if (fastifyError.validation) {
      return send(reply, request, 400, {
        code: 'VALIDATION_ERROR',
        message: 'The request contains invalid fields.',
        details: toDetails(fastifyError.validation as unknown as ValidationIssue[]),
      });
    }

    const status = fastifyError.statusCode ?? 500;
    if (status >= 400 && status < 500) {
      // Framework-level client errors: malformed JSON, unsupported media type, payload too large…
      request.log.info({ code: fastifyError.code }, 'Rejected malformed request');
      return send(reply, request, status === 404 ? 404 : status === 429 ? 429 : 400, {
        code: status === 404 ? 'NOT_FOUND' : status === 429 ? 'RATE_LIMITED' : 'VALIDATION_ERROR',
        message: status === 413 ? 'The request body is too large.' : status === 415 ? 'Requests must be sent as JSON.' : 'The request could not be processed.',
      });
    }

    request.log.error({ err: error }, 'Unhandled error');
    return send(reply, request, 500, {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong on our side. Please try again.',
    });
  });
}

export function apiNotFound(request: FastifyRequest, reply: FastifyReply) {
  return send(reply, request, 404, { code: 'NOT_FOUND', message: 'The requested resource does not exist.' });
}
