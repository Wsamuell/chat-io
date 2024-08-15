import { Hono } from 'hono';
import { showRoutes } from 'hono/dev';
import { logger } from 'hono/logger';
import { timing } from 'hono/timing';
import type { ContextVariables } from '../constant';
import { API_PREFIX } from '../constant';
import { attachUserId, checkJWTAuth } from '../middlewares/auth';
import type {
  DBChat,
  DBCreateChat,
  DBCreateMessage,
  DBCreateUser,
  DBMessage,
  DBUser,
} from '../models/db';
import { SimpleInMemoryResource } from '../storage/inmemory';
import { AUTH_PREFIX, createAuthApp } from './auth';
import { CHAT_PREFIX, createChatApp } from './chat';
import { cors } from 'hono/cors';
import { rateLimitMiddleware } from '../middlewares/rateLimiting';

const corsOption = {
  origin: [Bun.env.CORS_ORIGIN as string],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // length in seconds 24 hours
};

export function createMainApp(
  authApp: Hono<ContextVariables>,
  chatApp: Hono<ContextVariables>,
) {
  const app = new Hono<ContextVariables>().basePath(API_PREFIX);

  app.use('*', timing());
  app.use('*', logger());

  app.use('*', checkJWTAuth);
  app.use('*', attachUserId);
  app.use('*', rateLimitMiddleware);
  app.use('*', cors(corsOption));

  app.route(AUTH_PREFIX, authApp);
  app.route(CHAT_PREFIX, chatApp);

  showRoutes(app);

  return app;
}

export function createInMemoryApp() {
  return createMainApp(
    createAuthApp(new SimpleInMemoryResource<DBUser, DBCreateUser>()),
    createChatApp(
      new SimpleInMemoryResource<DBChat, DBCreateChat>(),
      new SimpleInMemoryResource<DBMessage, DBCreateMessage>(),
    ),
  );
}
