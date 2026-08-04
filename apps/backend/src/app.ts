import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { corsOrigins, isProd } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { sitemapRouter } from './routes/sitemap.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1); // correct client IPs behind a proxy (Railway/Render)
  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        // allow same-origin / server-to-server (no Origin header) and whitelisted origins
        if (!origin || corsOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  if (!isProd) app.use(morgan('dev'));

  app.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));

  app.use('/', sitemapRouter); // /sitemap.xml — dynamic, DB-driven
  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
