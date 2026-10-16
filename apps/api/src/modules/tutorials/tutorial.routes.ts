import { Type } from '@sinclair/typebox';
import { actorOf } from '../../plugins/auth.plugin.js';
import type { RoutePlugin } from '../../routes/types.js';
import {
  errorResponses,
  noContent,
  Paginated,
  PublicTutorialSchema,
  PublicTutorialSummarySchema,
  TutorialSchema,
} from '../../shared/http/dto-schemas.js';
import { DataEnvelope, IdParams, Nullable, PageQuery, RequiredText, SearchText, StatusSchema } from '../../shared/http/schemas.js';

const Id = Type.Integer({ minimum: 1, maximum: 2_147_483_647 });
const Sort = Type.Union([Type.Literal('newest'), Type.Literal('oldest'), Type.Literal('title')]);

const PublicQuery = Type.Object(
  {
    search: Type.Optional(SearchText),
    categoryId: Type.Optional(Id),
    difficultyLevelId: Type.Optional(Id),
    sort: Type.Optional(Sort),
    ...PageQuery,
  },
  { additionalProperties: false },
);

const ManageQuery = Type.Composite([PublicQuery, Type.Object({ status: Type.Optional(StatusSchema) })], {
  additionalProperties: false,
});

const fields = {
  title: RequiredText(200),
  description: RequiredText(20_000),
  prerequisites: Type.Optional(Nullable(Type.String({ maxLength: 2000 }))),
  categoryId: Id,
  difficultyLevelId: Id,
  status: Type.Optional(StatusSchema),
};

const CreateBody = Type.Object(fields, { additionalProperties: false });

const UpdateBody = Type.Object(
  {
    title: Type.Optional(fields.title),
    description: Type.Optional(fields.description),
    prerequisites: fields.prerequisites,
    categoryId: Type.Optional(Id),
    difficultyLevelId: Type.Optional(Id),
    status: fields.status,
    expectedUpdatedAt: Type.Optional(Type.String({ format: 'date-time' })),
  },
  { additionalProperties: false, minProperties: 1 },
);

export const publicTutorialRoutes: RoutePlugin = async (app, { container }) => {
  app.get(
    '/tutorials',
    { schema: { querystring: PublicQuery, response: { 200: Paginated(PublicTutorialSummarySchema), ...errorResponses } } },
    async (request) => container.tutorials.listPublicTutorials(request.query),
  );

  app.get(
    '/tutorials/:id',
    { schema: { params: IdParams, response: { 200: DataEnvelope(PublicTutorialSchema), ...errorResponses } } },
    async (request) => ({ data: await container.tutorials.getPublicTutorial(request.params.id) }),
  );
};

export const adminTutorialRoutes: RoutePlugin = async (app, { container }) => {
  const preHandler = app.requirePermission('tutorials:manage');

  app.get(
    '/tutorials',
    { preHandler, schema: { querystring: ManageQuery, response: { 200: Paginated(TutorialSchema), ...errorResponses } } },
    async (request) => container.tutorials.listTutorials(request.query, actorOf(request)),
  );

  app.get(
    '/tutorials/:id',
    { preHandler, schema: { params: IdParams, response: { 200: DataEnvelope(TutorialSchema), ...errorResponses } } },
    async (request) => ({ data: await container.tutorials.getTutorial(request.params.id, actorOf(request)) }),
  );

  app.post(
    '/tutorials',
    { preHandler, schema: { body: CreateBody, response: { 201: DataEnvelope(TutorialSchema), ...errorResponses } } },
    async (request, reply) => {
      const created = await container.tutorials.createTutorial(request.body, actorOf(request));
      return reply.status(201).send({ data: created });
    },
  );

  app.patch(
    '/tutorials/:id',
    {
      preHandler,
      schema: { params: IdParams, body: UpdateBody, response: { 200: DataEnvelope(TutorialSchema), ...errorResponses } },
    },
    async (request) => ({
      data: await container.tutorials.updateTutorial(request.params.id, request.body, actorOf(request)),
    }),
  );

  app.delete(
    '/tutorials/:id',
    { preHandler, schema: { params: IdParams, response: { ...noContent, ...errorResponses } } },
    async (request, reply) => {
      await container.tutorials.deleteTutorial(request.params.id, actorOf(request));
      return reply.status(204).send(null);
    },
  );
};
