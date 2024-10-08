import type { Context } from 'hono';
import type { ContextVariables } from '../constant';
import mainLogger from '../loggers';

interface CacheEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
  expiration: number;
}

const logger = mainLogger.child({ name: 'cacheMiddleware' });

export const cacheMiddleware = () => {
  const cache = new Map<string, CacheEntry>();

  return async (ctx: Context<ContextVariables>, next: () => Promise<void>) => {
    const userId = ctx.get('userId');
    const path = ctx.req.path;
    const cacheKey = `${path}: ${userId}`;

    ctx.set('cache', {
      cache: (body: object, expiration: number = 3600) => {
        const expireAt = Date.now() + expiration * 1000;
        const entry = { body, expiration: expireAt };
        logger.info(
          `Setting cache key: ${cacheKey}, to${JSON.stringify(entry)}`,
        );
        cache.set(cacheKey, entry);
      },
      clear: () => {
        logger.info(`Clearing cache key: ${cacheKey}`);
        cache.delete(cacheKey);
      },
      clearPath: (path: string) => {
        const fullKey = `${path}:${userId}`;
        logger.info(`Clearing cache key: ${fullKey}`);
        cache.delete(fullKey);
      },
    });
    if (ctx.req.method.toLocaleUpperCase() === 'GET') {
      const cacheEntry = cache.get(cacheKey);
      if (cacheEntry) {
        logger.info(
          `Found cache entry: ${cacheKey}, to${JSON.stringify(cacheEntry)}`,
        );
        if (cacheEntry.expiration > Date.now()) {
          logger.info(
            `return from key: ${cacheKey}, body: ${JSON.stringify(cacheEntry.body)}`,
          );
          return ctx.json(cacheEntry.body);
        } else {
          logger.info(`
            Cache entry expired cache key: ${cacheKey}, expiration: ${cacheEntry?.expiration}`);
        }
      }
    }
    await next();
  };
};
