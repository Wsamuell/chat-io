import type { Context } from 'hono';
import type { ContextVariables } from '../constant';

const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * NOTE:
 * Max number of request per window per client
 */
const Max_REQUESTS = 100;

/**
 * 15 minutes in milliseconds
 */
const WINDOW_SIZE_MS = 15 * 60 * 1000;

export const rateLimitMiddleware = async (
  ctx: Context<ContextVariables>,
  next: Function,
) => {
  const userId = ctx.get('userId');
  if (!userId) {
    await next();
    return;
  }

  const now = Date.now();
  let requestData = requestCounts.get(userId);

  if (!requestData) {
    requestData = { count: 1, resetTime: now + WINDOW_SIZE_MS };
    requestCounts.set(userId, requestData);
  } else {
    if (requestData.resetTime < now) {
      requestData.count = 1;
      requestData.resetTime = now + WINDOW_SIZE_MS;
    } else {
      requestData.count += 1;
    }
  }

  if (requestData.count > Max_REQUESTS) {
    return ctx.text('Rate Limit exceeded. Try again later', 429);
  } else {
    requestCounts.set(userId, requestData);
    await next();
  }
};
