import type { Context } from 'hono';
import { env } from 'hono/adapter';
import { jwt } from 'hono/jwt';
import { API_PREFIX } from '../constant';
import { AUTH_PREFIX, LOGIN_ROUTE, REGISTER_ROUTE } from '../controllers/auth';

import type { APIUser } from '../models/api';

export async function checkJWTAuth(
  ctx: Context,
  next: () => Promise<void>,
): Promise<Response | void> {
  if (
    ctx.req.path === API_PREFIX + AUTH_PREFIX + LOGIN_ROUTE ||
    ctx.req.path === API_PREFIX + AUTH_PREFIX + REGISTER_ROUTE
  ) {
    return await next();
  } else {
    const { JWT_SECRET } = env<{ JWT_SECRET: string }>(ctx);
    const jwtMiddleware = jwt({
      secret: JWT_SECRET,
    });
    return jwtMiddleware(ctx, next);
  }
}

export async function attachUserId(
  ctx: Context,
  next: () => Promise<void>,
): Promise<void> {
  const payload = ctx.get('jwtPayload') as APIUser;
  if (payload) {
    const id = payload.id;
    ctx.set('userId', id);
  }
  await next();
}
