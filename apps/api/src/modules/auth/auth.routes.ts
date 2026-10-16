import { Type } from '@sinclair/typebox';
import { actorOf } from '../../plugins/auth.plugin.js';
import type { RoutePlugin } from '../../routes/types.js';
import { errorResponses, noContent, SessionSchema } from '../../shared/http/dto-schemas.js';
import { DataEnvelope, Nullable } from '../../shared/http/schemas.js';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../../shared/security/password-hasher.js';
import { AppError } from '../../shared/errors/app-error.js';
import { toPrincipalDto } from '../users/user.mapper.js';
import { normalizeUsername } from './auth.service.js';

const LoginBody = Type.Object(
  {
    username: Type.String({ minLength: 1, maxLength: 50 }),
    password: Type.String({ minLength: 1, maxLength: PASSWORD_MAX_LENGTH }),
  },
  { additionalProperties: false },
);

export const ChangePasswordBody = Type.Object(
  {
    currentPassword: Type.String({ minLength: 1, maxLength: PASSWORD_MAX_LENGTH }),
    newPassword: Type.String({ minLength: PASSWORD_MIN_LENGTH, maxLength: PASSWORD_MAX_LENGTH }),
  },
  { additionalProperties: false },
);

export const authRoutes: RoutePlugin = async (app, { config, container }) => {
  app.post(
    '/auth/login',
    {
      config: {
        rateLimit: {
          max: config.loginRateLimitMax,
          timeWindow: '15 minutes',
          // Runs after body parsing so attempts are counted per IP + username.
          hook: 'preHandler',
          keyGenerator: (request) => {
            const body = request.body as { username?: unknown } | undefined;
            const username =
              typeof body?.username === 'string' ? normalizeUsername(body.username) : '';
            return `login:${request.ip}:${username}`;
          },
          errorResponseBuilder: () =>
            new AppError(
              'RATE_LIMITED',
              429,
              'Too many sign-in attempts. Please wait a few minutes and try again.',
            ),
        },
      },
      schema: {
        body: LoginBody,
        response: { 200: DataEnvelope(SessionSchema), ...errorResponses },
      },
    },
    async (request, reply) => {
      const result = await container.auth.login(request.body.username, request.body.password);
      app.setSessionCookie(reply, result.sessionToken, result.expiresAt);
      reply.header('cache-control', 'no-store');
      return { data: result.session };
    },
  );

  app.post(
    '/auth/logout',
    {
      preHandler: app.requireAuth,
      schema: { response: { ...noContent, 401: errorResponses[401], 403: errorResponses[403] } },
    },
    async (request, reply) => {
      await container.auth.logout(actorOf(request));
      app.clearSessionCookie(reply);
      return reply.status(204).send(null);
    },
  );

  app.get(
    '/auth/me',
    {
      preHandler: app.requireAuth,
      schema: { response: { 200: DataEnvelope(SessionSchema), 401: errorResponses[401] } },
    },
    async (request, reply) => {
      const actor = actorOf(request);
      reply.header('cache-control', 'no-store');
      return {
        data: {
          user: toPrincipalDto({
            id: actor.userId,
            username: actor.username,
            name: actor.name,
            role: actor.role,
          }),
          csrfToken: container.auth.csrfTokenFor(request.sessionToken!),
        },
      };
    },
  );

  // Non-failing variant for clients that just need to know whether anyone is signed in.
  app.get(
    '/auth/session',
    { schema: { response: { 200: DataEnvelope(Nullable(SessionSchema)) } } },
    async (request, reply) => {
      reply.header('cache-control', 'no-store');
      const actor = request.actor;
      if (!actor || !request.sessionToken) {
        if (request.sessionToken) app.clearSessionCookie(reply);
        return { data: null };
      }
      return {
        data: {
          user: toPrincipalDto({
            id: actor.userId,
            username: actor.username,
            name: actor.name,
            role: actor.role,
          }),
          csrfToken: container.auth.csrfTokenFor(request.sessionToken),
        },
      };
    },
  );

  app.post(
    '/auth/password',
    {
      preHandler: app.requireAuth,
      schema: { body: ChangePasswordBody, response: { ...noContent, ...errorResponses } },
    },
    async (request, reply) => {
      await container.users.changePassword(request.body, actorOf(request));
      return reply.status(204).send(null);
    },
  );
};
