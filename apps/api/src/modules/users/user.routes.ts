import { Type } from '@sinclair/typebox';
import { GENDERS } from '@mytutor/contracts';
import { actorOf } from '../../plugins/auth.plugin.js';
import type { RoutePlugin } from '../../routes/types.js';
import { errorResponses, Paginated, ProfileSchema, UserSchema } from '../../shared/http/dto-schemas.js';
import { DataEnvelope, IdParams, Nullable, PageQuery, RequiredText, SearchText, StatusSchema } from '../../shared/http/schemas.js';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../../shared/security/password-hasher.js';

const Gender = Type.Union(GENDERS.map((g) => Type.Literal(g)));
const Password = Type.String({ minLength: PASSWORD_MIN_LENGTH, maxLength: PASSWORD_MAX_LENGTH });

const profileFields = {
  name: RequiredText(100),
  email: Type.String({ format: 'email', maxLength: 254 }),
  dateOfBirth: Type.Optional(Nullable(Type.String({ format: 'date' }))),
  gender: Type.Optional(Nullable(Gender)),
  address: Type.Optional(Nullable(Type.String({ maxLength: 300 }))),
  mobile: Type.Optional(Nullable(Type.String({ maxLength: 20, pattern: '^$|^\\+?[0-9 ()-]{6,20}$' }))),
};

const ProfileBody = Type.Object(profileFields, { additionalProperties: false });

const CreateUserBody = Type.Object(
  {
    ...profileFields,
    username: Type.String({ minLength: 3, maxLength: 50, pattern: '^[A-Za-z0-9._-]+$' }),
    password: Password,
    status: Type.Optional(StatusSchema),
  },
  { additionalProperties: false },
);

const UpdateUserBody = Type.Object(
  {
    name: Type.Optional(profileFields.name),
    email: Type.Optional(profileFields.email),
    dateOfBirth: profileFields.dateOfBirth,
    gender: profileFields.gender,
    address: profileFields.address,
    mobile: profileFields.mobile,
    status: Type.Optional(StatusSchema),
    password: Type.Optional(Password),
  },
  { additionalProperties: false, minProperties: 1 },
);

const ListQuery = Type.Object({ search: Type.Optional(SearchText), ...PageQuery }, { additionalProperties: false });

export const adminUserRoutes: RoutePlugin = async (app, { container }) => {
  const preHandler = app.requirePermission('users:manage');

  app.get(
    '/users',
    { preHandler, schema: { querystring: ListQuery, response: { 200: Paginated(UserSchema), ...errorResponses } } },
    async (request) => container.users.listUsers(request.query, actorOf(request)),
  );
  app.get(
    '/users/:id',
    { preHandler, schema: { params: IdParams, response: { 200: DataEnvelope(UserSchema), ...errorResponses } } },
    async (request) => ({ data: await container.users.getUser(request.params.id, actorOf(request)) }),
  );
  app.post(
    '/users',
    { preHandler, schema: { body: CreateUserBody, response: { 201: DataEnvelope(UserSchema), ...errorResponses } } },
    async (request, reply) => reply.status(201).send({ data: await container.users.createUser(request.body, actorOf(request)) }),
  );
  app.patch(
    '/users/:id',
    {
      preHandler,
      schema: { params: IdParams, body: UpdateUserBody, response: { 200: DataEnvelope(UserSchema), ...errorResponses } },
    },
    async (request) => ({ data: await container.users.updateUser(request.params.id, request.body, actorOf(request)) }),
  );
};

export const profileRoutes: RoutePlugin = async (app, { container }) => {
  const preHandler = app.requirePermission('profile:manage');

  app.get(
    '/profile',
    { preHandler, schema: { response: { 200: DataEnvelope(ProfileSchema), ...errorResponses } } },
    async (request) => ({ data: await container.users.getProfile(actorOf(request)) }),
  );
  app.put(
    '/profile',
    { preHandler, schema: { body: ProfileBody, response: { 200: DataEnvelope(ProfileSchema), ...errorResponses } } },
    async (request) => ({ data: await container.users.updateProfile(request.body, actorOf(request)) }),
  );
};
