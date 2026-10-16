import { Type, type TSchema } from '@sinclair/typebox';
import type { Permission } from '@mytutor/contracts';
import { actorOf } from '../../plugins/auth.plugin.js';
import type { RoutePlugin } from '../../routes/types.js';
import {
  CategorySchema,
  DifficultyLevelSchema,
  errorResponses,
  noContent,
  Paginated,
  PublicCategorySchema,
  PublicDifficultyLevelSchema,
} from '../../shared/http/dto-schemas.js';
import {
  DataEnvelope,
  IdParams,
  Nullable,
  PageQuery,
  RequiredText,
  SearchText,
  StatusSchema,
} from '../../shared/http/schemas.js';
import type { ReferenceDataService } from './reference-data.service.js';
import {
  toCategoryDto,
  toDifficultyLevelDto,
  toPublicCategoryDto,
  toPublicDifficultyLevelDto,
} from './reference.mapper.js';
import type { ReferenceRecord } from './reference.types.js';

const ListQuery = Type.Object(
  { search: Type.Optional(SearchText), status: Type.Optional(StatusSchema), ...PageQuery },
  { additionalProperties: false },
);

const baseFields = {
  title: RequiredText(100),
  description: Type.Optional(Nullable(Type.String({ maxLength: 1000 }))),
  status: Type.Optional(StatusSchema),
};
const levelFields = {
  ...baseFields,
  sortOrder: Type.Optional(Type.Integer({ minimum: 0, maximum: 1000 })),
};

interface ResourceDefinition {
  path: string;
  permission: Permission;
  service: (c: RouteContainer) => ReferenceDataService;
  fields: Record<string, TSchema>;
  schema: TSchema;
  toDto: (r: ReferenceRecord) => unknown;
}

type RouteContainer = Parameters<RoutePlugin>[1]['container'];

/** Registers the identical CRUD surface for categories and difficulty levels. */
function referenceCrud(definition: ResourceDefinition): RoutePlugin {
  return async (app, { container }) => {
    const service = definition.service(container);
    const preHandler = app.requirePermission(definition.permission);
    const { title, ...optional } = definition.fields;
    const CreateBody = Type.Object(definition.fields, { additionalProperties: false });
    const UpdateBody = Type.Object(
      { title: Type.Optional(title!), ...optional },
      { additionalProperties: false, minProperties: 1 },
    );
    type Input = {
      title: string;
      description?: string | null;
      status?: 'ACTIVE' | 'INACTIVE';
      sortOrder?: number;
    };

    app.get(
      definition.path,
      {
        preHandler,
        schema: {
          querystring: ListQuery,
          response: { 200: Paginated(definition.schema), ...errorResponses },
        },
      },
      async (request) => {
        const result = await service.list(request.query, actorOf(request));
        return { data: result.items.map(definition.toDto), pagination: result.pagination };
      },
    );

    app.get(
      `${definition.path}/:id`,
      {
        preHandler,
        schema: {
          params: IdParams,
          response: { 200: DataEnvelope(definition.schema), ...errorResponses },
        },
      },
      async (request) => ({
        data: definition.toDto(await service.get(request.params.id, actorOf(request))),
      }),
    );

    app.post(
      definition.path,
      {
        preHandler,
        schema: {
          body: CreateBody,
          response: { 201: DataEnvelope(definition.schema), ...errorResponses },
        },
      },
      async (request, reply) => {
        const created = await service.create(request.body as Input, actorOf(request));
        return reply.status(201).send({ data: definition.toDto(created) });
      },
    );

    app.patch(
      `${definition.path}/:id`,
      {
        preHandler,
        schema: {
          params: IdParams,
          body: UpdateBody,
          response: { 200: DataEnvelope(definition.schema), ...errorResponses },
        },
      },
      async (request) => ({
        data: definition.toDto(
          await service.update(request.params.id, request.body as Partial<Input>, actorOf(request)),
        ),
      }),
    );

    app.delete(
      `${definition.path}/:id`,
      { preHandler, schema: { params: IdParams, response: { ...noContent, ...errorResponses } } },
      async (request, reply) => {
        await service.delete(request.params.id, actorOf(request));
        return reply.status(204).send(null);
      },
    );
  };
}

export const adminCategoryRoutes = referenceCrud({
  path: '/categories',
  permission: 'categories:manage',
  service: (c) => c.categories,
  fields: baseFields,
  schema: CategorySchema,
  toDto: toCategoryDto,
});

export const adminDifficultyLevelRoutes = referenceCrud({
  path: '/difficulty-levels',
  permission: 'difficultyLevels:manage',
  service: (c) => c.difficultyLevels,
  fields: levelFields,
  schema: DifficultyLevelSchema,
  toDto: toDifficultyLevelDto,
});

/** Public, active-only lists used by catalogue filters. */
export const publicReferenceRoutes: RoutePlugin = async (app, { container }) => {
  app.get(
    '/categories',
    { schema: { response: { 200: DataEnvelope(Type.Array(PublicCategorySchema)) } } },
    async () => ({ data: (await container.categories.listActive()).map(toPublicCategoryDto) }),
  );
  app.get(
    '/difficulty-levels',
    { schema: { response: { 200: DataEnvelope(Type.Array(PublicDifficultyLevelSchema)) } } },
    async () => ({
      data: (await container.difficultyLevels.listActive()).map(toPublicDifficultyLevelDto),
    }),
  );
};
