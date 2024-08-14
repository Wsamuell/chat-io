import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { sign } from 'hono/jwt';
import type { ContextVariables } from '../constant';
import type { DBCreateUser, DBUser, Email } from '../models/db';
import type { IDatabaseResource } from '../storage/types';

// validation
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const registerSchema = z.object({
  email: z
    .string()
    .email()
    .transform((x) => x as Email),
  password: z.string().min(6),
  name: z.string().min(4),
});

const loginSchema = z.object({
  email: z
    .string()
    .email()
    .transform((x) => x as Email),
  password: z.string().min(4),
});

export const AUTH_PREFIX = '/auth/';
export const LOGIN_ROUTE = 'login/';
export const REGISTER_ROUTE = 'signup/';

export const authApp = new Hono<ContextVariables>();

export const ERROR_USER_ALREADY_EXIST = 'USER_ALREADY_EXIST';
export const ERROR_INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';

export function createAuthApp(
  userResource: IDatabaseResource<DBUser, DBCreateUser>,
) {
  authApp.post(
    REGISTER_ROUTE,
    zValidator('json', registerSchema),
    async (ctx) => {
      const { email, password, name } = await ctx.req.valid('json');
      if (await userResource.find({ email })) {
        return ctx.json({ error: ERROR_USER_ALREADY_EXIST }, 400);
      }
      const hashPassword = await Bun.password.hash(password, {
        algorithm: 'bcrypt',
      });
      await userResource.create({ name, email, password: hashPassword });
      return ctx.json({ success: true });
    },
  );

  authApp.post(LOGIN_ROUTE, zValidator('json', loginSchema), async (ctx) => {
    const { email, password } = await ctx.req.valid('json');
    const user = await userResource.find({ email });
    if (!user || !(await Bun.password.verify(password, user.password))) {
      return ctx.json({ error: ERROR_INVALID_CREDENTIALS }, 401);
    }
    const { JWT_SECRET } = env<{ JWT_SECRET: string }, typeof ctx>(ctx);
    const token = await sign({ ...user, password: undefined }, JWT_SECRET);
    return ctx.json({ token });
  });

  return authApp;
}
