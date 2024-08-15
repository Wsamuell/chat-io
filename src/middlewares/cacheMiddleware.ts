import type { Context } from 'hono';
import type { ContextVariables } from '../constant';

interface CacheEntry {
  body: any;
  expiration: number;
}

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
        cache.set(cacheKey, entry);
      },
      clear: () => {
        cache.delete(cacheKey);
      },
      clearPath: (path: string) => {
        const fullKey = `${path}:${userId}`;
        cache.delete(fullKey);
      },
    });
    if (ctx.req.method.toLocaleUpperCase() === 'GET') {
      const cacheEntry = cache.get(cacheKey);
      if (cacheEntry) {
        if (cacheEntry.expiration > Date.now()) {
          return ctx.json(cacheEntry.body);
        }
      }
    }
    await next();
  };
};
