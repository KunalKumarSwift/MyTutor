import { buildApp } from './app.js';
import { ConfigError, loadConfig } from './config/env.js';
import { createContainer } from './container.js';
import { createPrismaClient } from './infrastructure/database/prisma.js';

async function main() {
  const config = loadConfig();
  const db = createPrismaClient(config.databaseUrl);
  const app = await buildApp({
    config,
    createContainer: (logger) => createContainer(config, db, logger),
    ...(config.isProduction
      ? {}
      : { logger: { level: config.logLevel, transport: { target: 'pino-pretty', options: { singleLine: true } } } }),
  });

  // Periodically purge expired sessions (they are also rejected on use).
  const purge = setInterval(() => {
    app.container.auth
      .purgeExpiredSessions()
      .then((count) => count > 0 && app.log.info({ count }, 'Purged expired sessions'))
      .catch((err: unknown) => app.log.error({ err }, 'Session purge failed'));
  }, 60 * 60 * 1000);
  purge.unref();

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'Shutting down');
    clearInterval(purge);
    await app.close();
    process.exit(0);
  };
  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));

  await app.listen({ host: config.host, port: config.port });
}

main().catch((error: unknown) => {
  if (error instanceof ConfigError) {
    console.error(error.message);
  } else {
    console.error('Failed to start MyTutor API:', error);
  }
  process.exit(1);
});
