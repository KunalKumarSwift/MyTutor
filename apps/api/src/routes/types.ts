import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import type { AppConfig } from '../config/env.js';
import type { Container } from '../container.js';

export interface RouteOptions {
  config: AppConfig;
  container: Container;
}

export type RoutePlugin = FastifyPluginAsyncTypebox<RouteOptions>;
