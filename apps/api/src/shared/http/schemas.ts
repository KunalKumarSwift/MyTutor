import { Type, type TSchema } from '@sinclair/typebox';
import { MAX_PAGE_SIZE, RECORD_STATUSES } from '@mytutor/contracts';

export const IdParams = Type.Object({ id: Type.Integer({ minimum: 1, maximum: 2_147_483_647 }) });

export const PageQuery = {
  page: Type.Optional(Type.Integer({ minimum: 1, maximum: 100_000 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1, maximum: MAX_PAGE_SIZE })),
};

export const StatusSchema = Type.Union(RECORD_STATUSES.map((s) => Type.Literal(s)));

export const SearchText = Type.String({ maxLength: 100 });

/** A required, trimmed-by-service string with visible content. */
export const RequiredText = (maxLength: number) =>
  Type.String({ minLength: 1, maxLength, pattern: '\\S' });

export const Nullable = <T extends TSchema>(schema: T) => Type.Union([schema, Type.Null()]);

export const DataEnvelope = <T extends TSchema>(schema: T) => Type.Object({ data: schema });
