import { Type } from '@sinclair/typebox';
import type { RoutePlugin } from '../../routes/types.js';

const HealthSchema = Type.Object({
  data: Type.Object({ status: Type.String(), database: Type.String() }),
});

export const healthRoutes: RoutePlugin = async (app, { container }) => {
  app.get(
    '/health',
    { config: { rateLimit: false }, schema: { response: { 200: HealthSchema, 503: HealthSchema } } },
    async (request, reply) => {
      try {
        await container.checkDatabase();
        return { data: { status: 'ok', database: 'ok' } };
      } catch (error) {
        request.log.error({ err: error }, 'Health check: database unavailable');
        return reply.status(503).send({ data: { status: 'degraded', database: 'unavailable' } });
      }
    },
  );
};
