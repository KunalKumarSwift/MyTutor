import { Type, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

const EnvSchema = Type.Object({
  NODE_ENV: Type.Union([Type.Literal('development'), Type.Literal('test'), Type.Literal('production')], {
    default: 'development',
  }),
  HOST: Type.String({ default: '127.0.0.1' }),
  PORT: Type.Integer({ minimum: 1, maximum: 65535, default: 3000 }),
  LOG_LEVEL: Type.Union(
    ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'].map((l) => Type.Literal(l)),
    { default: 'info' },
  ),
  DATABASE_URL: Type.String({ minLength: 1 }),
  SESSION_SECRET: Type.String({ minLength: 32 }),
  SESSION_TTL_SECONDS: Type.Integer({ minimum: 300, maximum: 60 * 60 * 24 * 30, default: 28800 }),
  ALLOWED_ORIGINS: Type.String({ default: '' }),
  COOKIE_SECURE: Type.Boolean({ default: false }),
  TRUST_PROXY: Type.Boolean({ default: false }),
  WEB_DIST_DIR: Type.String({ default: '' }),
  LOGIN_RATE_LIMIT_MAX: Type.Integer({ minimum: 1, default: 10 }),
  API_RATE_LIMIT_MAX: Type.Integer({ minimum: 1, default: 600 }),
});

type RawEnv = Static<typeof EnvSchema>;

export interface AppConfig {
  env: RawEnv['NODE_ENV'];
  isProduction: boolean;
  host: string;
  port: number;
  logLevel: string;
  databaseUrl: string;
  sessionSecret: string;
  sessionTtlSeconds: number;
  allowedOrigins: string[];
  cookieSecure: boolean;
  trustProxy: boolean;
  webDistDir: string | null;
  loginRateLimitMax: number;
  apiRateLimitMax: number;
}

export class ConfigError extends Error {
  override name = 'ConfigError';
}

/** Parses and validates configuration. Fails fast with a readable message. */
export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  const input: Record<string, unknown> = {};
  for (const key of Object.keys(EnvSchema.properties)) {
    const value = source[key];
    if (value !== undefined && value !== '') input[key] = value;
  }
  const withDefaults = Value.Default(EnvSchema, input);
  const converted = Value.Convert(EnvSchema, withDefaults);
  const errors = [...Value.Errors(EnvSchema, converted)];
  if (errors.length > 0) {
    const lines = errors.map((e) => `  ${e.path.replace(/^\//, '') || '(root)'}: ${e.message}`);
    throw new ConfigError(`Invalid environment configuration:\n${[...new Set(lines)].join('\n')}`);
  }
  const env = converted as RawEnv;

  const config: AppConfig = {
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    host: env.HOST,
    port: env.PORT,
    logLevel: env.LOG_LEVEL,
    databaseUrl: env.DATABASE_URL,
    sessionSecret: env.SESSION_SECRET,
    sessionTtlSeconds: env.SESSION_TTL_SECONDS,
    allowedOrigins: env.ALLOWED_ORIGINS.split(',')
      .map((o) => o.trim().replace(/\/$/, ''))
      .filter(Boolean),
    cookieSecure: env.COOKIE_SECURE,
    trustProxy: env.TRUST_PROXY,
    webDistDir: env.WEB_DIST_DIR || null,
    loginRateLimitMax: env.LOGIN_RATE_LIMIT_MAX,
    apiRateLimitMax: env.API_RATE_LIMIT_MAX,
  };

  if (config.isProduction) {
    if (!config.cookieSecure) throw new ConfigError('COOKIE_SECURE must be true in production.');
    if (/replace-with|changeme/i.test(config.sessionSecret)) {
      throw new ConfigError('SESSION_SECRET still contains the example placeholder value.');
    }
    if (config.allowedOrigins.length === 0) {
      throw new ConfigError('ALLOWED_ORIGINS must list the public origin in production.');
    }
  }
  return config;
}
