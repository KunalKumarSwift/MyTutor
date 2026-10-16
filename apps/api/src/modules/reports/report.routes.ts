import { Type } from '@sinclair/typebox';
import { actorOf } from '../../plugins/auth.plugin.js';
import type { RoutePlugin } from '../../routes/types.js';
import { errorResponses, Paginated, TutorialReportRowSchema } from '../../shared/http/dto-schemas.js';
import { PageQuery } from '../../shared/http/schemas.js';

const Query = Type.Object(
  {
    from: Type.Optional(Type.String({ format: 'date' })),
    to: Type.Optional(Type.String({ format: 'date' })),
    ...PageQuery,
  },
  { additionalProperties: false },
);

export const reportRoutes: RoutePlugin = async (app, { container }) => {
  app.get(
    '/reports/tutorials',
    {
      preHandler: app.requirePermission('reports:view'),
      schema: { querystring: Query, response: { 200: Paginated(TutorialReportRowSchema), ...errorResponses } },
    },
    async (request) => container.reports.tutorialReport(request.query, actorOf(request)),
  );
};
