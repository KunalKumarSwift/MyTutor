import { CSRF_HEADER, type Permission } from '@mytutor/contracts';
import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  preHandlerAsyncHookHandler,
} from 'fastify';
import fp from 'fastify-plugin';
import type { AppConfig } from '../config/env.js';
import type { Container } from '../container.js';
import type { AuthenticatedActor } from '../modules/auth/auth.types.js';
import { AppError, forbidden, unauthenticated } from '../shared/errors/app-error.js';
import { safeEqual } from '../shared/security/tokens.js';

declare module 'fastify' {
  interface FastifyRequest {
    actor: AuthenticatedActor | null;
    sessionToken: string | null;
  }
  interface FastifyInstance {
    requireAuth: preHandlerAsyncHookHandler;
    requirePermission(permission: Permission): preHandlerAsyncHookHandler;
    setSessionCookie(reply: FastifyReply, token: string, expiresAt: Date): void;
    clearSessionCookie(reply: FastifyReply): void;
  }
}

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** `__Host-` prefix pins the cookie to this exact origin; it requires Secure, so only in HTTPS. */
export const sessionCookieName = (config: AppConfig) =>
  config.cookieSecure ? '__Host-mytutor_session' : 'mytutor_session';

function requestOrigin(request: FastifyRequest): string | null {
  const origin = request.headers.origin;
  if (origin && origin !== 'null') return origin;
  const referer = request.headers.referer;
  if (!referer) return origin === 'null' ? 'null' : null;
  try {
    return new URL(referer).origin;
  } catch {
    return 'null';
  }
}

/**
 * Session resolution, origin checks and CSRF protection.
 * - Every unsafe /api request carrying an Origin/Referer must come from an allowed origin.
 * - Authenticated unsafe requests must also present the session-bound CSRF token header.
 */
export const authPlugin = fp<{ config: AppConfig; container: Container }>(
  async (app: FastifyInstance, { config, container }) => {
    const cookieName = sessionCookieName(config);

    app.decorateRequest('actor', null);
    app.decorateRequest('sessionToken', null);

    app.addHook('onRequest', async (request) => {
      if (!request.url.startsWith('/api/')) return;

      if (UNSAFE_METHODS.has(request.method)) {
        const origin = requestOrigin(request);
        const selfOrigin = `${request.protocol}://${request.host}`;
        if (origin !== null && origin !== selfOrigin && !config.allowedOrigins.includes(origin)) {
          throw new AppError('FORBIDDEN', 403, 'Cross-origin request rejected.');
        }
      }

      const token = request.cookies[cookieName];
      if (token) {
        request.sessionToken = token;
        request.actor = await container.auth.authenticate(token);
      }
    });

    app.decorate('setSessionCookie', (reply: FastifyReply, token: string, expiresAt: Date) => {
      reply.setCookie(cookieName, token, {
        httpOnly: true,
        secure: config.cookieSecure,
        sameSite: 'lax',
        path: '/',
        expires: expiresAt,
      });
    });

    app.decorate('clearSessionCookie', (reply: FastifyReply) => {
      reply.clearCookie(cookieName, {
        path: '/',
        httpOnly: true,
        secure: config.cookieSecure,
        sameSite: 'lax',
      });
    });

    const requireAuth: preHandlerAsyncHookHandler = async function (request, reply) {
      if (!request.actor || !request.sessionToken) {
        if (request.sessionToken) app.clearSessionCookie(reply);
        throw unauthenticated();
      }
      if (UNSAFE_METHODS.has(request.method)) {
        const provided = request.headers[CSRF_HEADER];
        const expected = container.auth.csrfTokenFor(request.sessionToken);
        if (typeof provided !== 'string' || !safeEqual(provided, expected)) {
          throw new AppError(
            'CSRF_INVALID',
            403,
            'Your session security token is missing or invalid. Reload and try again.',
          );
        }
      }
    };

    app.decorate('requireAuth', requireAuth);
    app.decorate('requirePermission', (permission: Permission): preHandlerAsyncHookHandler => {
      return async function (request, reply) {
        await requireAuth.call(this, request, reply);
        if (!container.policy.can(request.actor!, permission)) throw forbidden();
      };
    });
  },
);

/** Narrows request.actor after requireAuth/requirePermission has run. */
export function actorOf(request: FastifyRequest): AuthenticatedActor {
  if (!request.actor) throw unauthenticated();
  return request.actor;
}
