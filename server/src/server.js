import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import app from './app.js';

let httpServer;

async function start() {
  await connectDatabase();
  httpServer = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Wassila API listening');
  });
}

async function shutdown(signal) {
  logger.info({ signal }, 'Shutting down');
  try {
    if (httpServer) {
      await new Promise((resolve) => httpServer.close(resolve));
    }
    await disconnectDatabase();
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Error during shutdown');
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled promise rejection');
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});

start().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});