import { actorOf } from '../../plugins/auth.plugin.js';
import type { RoutePlugin } from '../../routes/types.js';
import { DashboardSchema, errorResponses } from '../../shared/http/dto-schemas.js';
import { DataEnvelope } from '../../shared/http/schemas.js';

export const dashboardRoutes: RoutePlugin = async (app, { container }) => {
  app.get(
    '/dashboard',
    {
      preHandler: app.requirePermission('tutorials:manage'),
      schema: { response: { 200: DataEnvelope(DashboardSchema), ...errorResponses } },
    },
    async (request) => ({ data: await container.dashboard.overview(actorOf(request)) }),
  );
};
