import { Type, type TSchema } from '@sinclair/typebox';
import { ERROR_CODES, GENDERS, PERMISSIONS, ROLES } from '@mytutor/contracts';
import { Nullable, StatusSchema } from './schemas.js';

const literals = (values: readonly string[]) => Type.Union(values.map((v) => Type.Literal(v)));
const DateTime = Type.String({ format: 'date-time' });

export const PaginationSchema = Type.Object({
  page: Type.Integer(),
  pageSize: Type.Integer(),
  totalItems: Type.Integer(),
  totalPages: Type.Integer(),
});

export const Paginated = <T extends TSchema>(item: T) =>
  Type.Object({ data: Type.Array(item), pagination: PaginationSchema });

export const ErrorSchema = Type.Object({
  error: Type.Object({
    code: literals(ERROR_CODES),
    message: Type.String(),
    details: Type.Optional(Type.Array(Type.Object({ field: Type.String(), message: Type.String() }))),
    requestId: Type.String(),
  }),
});

const Ref = Type.Object({ id: Type.Integer(), title: Type.String() });
const RefWithStatus = Type.Object({ id: Type.Integer(), title: Type.String(), status: StatusSchema });
const Author = Type.Object({ id: Type.Integer(), username: Type.String(), name: Type.String() });

export const PublicTutorialSummarySchema = Type.Object({
  id: Type.Integer(),
  title: Type.String(),
  prerequisites: Nullable(Type.String()),
  excerpt: Type.String(),
  category: Ref,
  difficultyLevel: Type.Object({ id: Type.Integer(), title: Type.String(), sortOrder: Type.Integer() }),
  createdAt: DateTime,
});

export const PublicTutorialSchema = Type.Object({
  id: Type.Integer(),
  title: Type.String(),
  prerequisites: Nullable(Type.String()),
  description: Type.String(),
  category: Ref,
  difficultyLevel: Type.Object({ id: Type.Integer(), title: Type.String(), sortOrder: Type.Integer() }),
  createdAt: DateTime,
  updatedAt: DateTime,
});

export const TutorialSchema = Type.Object({
  id: Type.Integer(),
  title: Type.String(),
  description: Type.String(),
  prerequisites: Nullable(Type.String()),
  status: StatusSchema,
  category: RefWithStatus,
  difficultyLevel: RefWithStatus,
  author: Author,
  createdAt: DateTime,
  updatedAt: DateTime,
});

export const PublicCategorySchema = Type.Object({
  id: Type.Integer(),
  title: Type.String(),
  description: Nullable(Type.String()),
  tutorialCount: Type.Integer(),
});

export const PublicDifficultyLevelSchema = Type.Object({
  id: Type.Integer(),
  title: Type.String(),
  description: Nullable(Type.String()),
  sortOrder: Type.Integer(),
});

export const CategorySchema = Type.Object({
  id: Type.Integer(),
  title: Type.String(),
  description: Nullable(Type.String()),
  status: StatusSchema,
  tutorialCount: Type.Integer(),
  createdAt: DateTime,
  updatedAt: DateTime,
});

export const DifficultyLevelSchema = Type.Composite([CategorySchema, Type.Object({ sortOrder: Type.Integer() })]);

export const PrincipalSchema = Type.Object({
  id: Type.Integer(),
  username: Type.String(),
  name: Type.String(),
  role: literals(ROLES),
  permissions: Type.Array(literals(PERMISSIONS)),
});

export const SessionSchema = Type.Object({ user: PrincipalSchema, csrfToken: Type.String() });

export const ProfileSchema = Type.Object({
  id: Type.Integer(),
  username: Type.String(),
  role: literals(ROLES),
  name: Type.String(),
  email: Nullable(Type.String()),
  dateOfBirth: Nullable(Type.String()),
  gender: Nullable(literals(GENDERS)),
  address: Nullable(Type.String()),
  mobile: Nullable(Type.String()),
});

export const UserSchema = Type.Composite([
  ProfileSchema,
  Type.Object({ status: StatusSchema, createdAt: DateTime, updatedAt: DateTime }),
]);

export const TutorialReportRowSchema = Type.Object({
  tutorialId: Type.Integer(),
  tutorialTitle: Type.String(),
  tutorialStatus: StatusSchema,
  author: Author,
  category: Type.String(),
  difficultyLevel: Type.String(),
  createdAt: DateTime,
});

export const AuditEventSchema = Type.Object({
  id: Type.Integer(),
  action: Type.String(),
  entityType: Type.String(),
  entityId: Type.String(),
  summary: Type.String(),
  actor: Nullable(Type.Object({ id: Type.Integer(), username: Type.String() })),
  createdAt: DateTime,
});

export const DashboardSchema = Type.Object({
  tutorials: Type.Object({ total: Type.Integer(), active: Type.Integer(), inactive: Type.Integer() }),
  categories: Type.Integer(),
  difficultyLevels: Type.Integer(),
  users: Nullable(Type.Integer()),
  recentTutorials: Type.Array(
    Type.Object({ id: Type.Integer(), title: Type.String(), status: StatusSchema, createdAt: DateTime }),
  ),
  recentActivity: Type.Array(AuditEventSchema),
});

/** Standard error responses attached to every route for documentation and serialization. */
export const errorResponses = {
  400: ErrorSchema,
  401: ErrorSchema,
  403: ErrorSchema,
  404: ErrorSchema,
  409: ErrorSchema,
  422: ErrorSchema,
  429: ErrorSchema,
  500: ErrorSchema,
} as const;
