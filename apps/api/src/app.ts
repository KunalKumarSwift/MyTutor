import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import type { AppConfig } from './config/env.js';
import type { Container } from './container.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { healthRoutes } from './modules/health/health.routes.js';
import {
  adminCategoryRoutes,
  adminDifficultyLevelRoutes,
  publicReferenceRoutes,
} from './modules/reference-data/reference.routes.js';
import { reportRoutes } from './modules/reports/report.routes.js';
import { adminTutorialRoutes, publicTutorialRoutes } from './modules/tutorials/tutorial.routes.js';
import { adminUserRoutes, profileRoutes } from './modules/users/user.routes.js';
import { authPlugin } from './plugins/auth.plugin.js';
import { apiNotFound, registerErrorHandling } from './plugins/error-handler.js';
import { AppError } from './shared/errors/app-error.js';

export interface BuildAppOptions {
  config: AppConfig;
  /** Builds the dependency container once the logger exists. */
  createContainer: (logger: FastifyInstance['log']) => Container;
  logger?: FastifyServerOptions['logger'];
}

declare module 'fastify' {
  interface FastifyInstance {
    container: Container;
  }
}

const REQUEST_ID = /^[A-Za-z0-9._-]{8,64}$/;

export async function buildApp({ config, createContainer, logger }: BuildAppOptions) {
  const app = Fastify({
    logger: logger ?? {
      level: config.logLevel,
      redact: {
        paths: ['req.headers.cookie', 'req.headers.authorization', 'req.headers["x-csrf-token"]', 'res.headers["set-cookie"]'],
        censor: '[redacted]',
      },
    },
    trustProxy: config.trustProxy,
    bodyLimit: 256 * 1024,
    requestIdHeader: false,
    genReqId: (req) => {
      const incoming = req.headers['x-request-id'];
      return typeof incoming === 'string' && REQUEST_ID.test(incoming) ? incoming : randomUUID();
    },
    ajv: { customOptions: { removeAdditional: false, coerceTypes: 'array', allErrors: true } },
  }).withTypeProvider<TypeBoxTypeProvider>();

  const container = createContainer(app.log);
  app.decorate('container', container);

  app.addHook('onSend', async (request, reply) => {
    reply.header('x-request-id', request.id);
  });
  app.addHook('onClose', async () => {
    await container.db.$disconnect();
  });

  registerErrorHandling(app);

  await app.register(helmet, {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        ...(config.isProduction ? { upgradeInsecureRequests: [] } : {}),
      },
    },
    strictTransportSecurity: config.isProduction ? { maxAge: 31_536_000, includeSubDomains: true } : false,
    crossOriginEmbedderPolicy: false,
  });
  await app.register(cookie);
  await app.register(rateLimit, {
    global: true,
    max: config.apiRateLimitMax,
    timeWindow: '1 minute',
    errorResponseBuilder: () => new AppError('RATE_LIMITED', 429, 'Too many requests. Please slow down and try again shortly.'),
  });
  await app.register(authPlugin, { config, container });

  await app.register(
    async (api) => {
      api.addHook('onSend', async (_request, reply) => {
        if (!reply.hasHeader('cache-control')) reply.header('cache-control', 'no-store');
      });
      const options = { config, container };
      await api.register(healthRoutes, options);
      await api.register(authRoutes, options);
      await api.register(publicTutorialRoutes, options);
      await api.register(publicReferenceRoutes, options);
      await api.register(profileRoutes, options);
      await api.register(
        async (admin) => {
          await admin.register(dashboardRoutes, options);
          await admin.register(adminTutorialRoutes, options);
          await admin.register(adminCategoryRoutes, options);
          await admin.register(adminDifficultyLevelRoutes, options);
          await admin.register(adminUserRoutes, options);
          await admin.register(reportRoutes, options);
        },
        { prefix: '/admin' },
      );
    },
    { prefix: '/api/v1' },
  );

  const webRoot = config.webDistDir ? resolve(config.webDistDir) : null;
  if (webRoot && existsSync(resolve(webRoot, 'index.html'))) {
    await app.register(fastifyStatic, {
      root: webRoot,
      wildcard: false,
      index: false,
      setHeaders(res, path) {
        // Hashed build assets never change; the HTML shell must always be revalidated.
        res.header('cache-control', path.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache');
      },
    });
    app.get('/*', { config: { rateLimit: false } }, async (request, reply) => {
      const path = (request.params as { '*': string })['*'];
      if (path && /\.[a-z0-9]+$/i.test(path)) {
        return reply.sendFile(path);
      }
      return reply.header('cache-control', 'no-cache').sendFile('index.html');
    });
  } else if (webRoot) {
    app.log.warn({ webRoot }, 'WEB_DIST_DIR is set but index.html was not found; static serving disabled');
  }

  app.setNotFoundHandler(apiNotFound);
  return app;
}
