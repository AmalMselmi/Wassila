import crypto from 'node:crypto';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import routes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.disable('x-powered-by');

// Request logging with a request id (also returned to the client).
app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const id = crypto.randomUUID();
      res.setHeader('X-Request-Id', id);
      return id;
    },
    autoLogging: { ignore: (req) => req.url.startsWith('/api/v1/health') },
  })
);

app.use(helmet());

// CORS allowlist: only origins listed in CORS_ORIGINS may call the API from a browser.
app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (curl, server-to-server) are not browser CORS requests.
      if (!origin || env.CORS_ORIGINS.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);

// Small body limit: file uploads get their own dedicated handling later.
app.use(express.json({ limit: '100kb' }));

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;