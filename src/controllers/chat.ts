import { Hono } from 'hono';
import type { ContextVariables } from '../constant';
import type {
  DBChat,
  DBCreateChat,
  DBCreateMessage,
  DBMessage,
} from '../models/db';
import type { IDatabaseResource } from '../storage/types';

// validation
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { generateMessageResponse } from '../integrations/generate_message';

const idSchema = z.object({
  id: z.string().min(1),
});

const chatSchema = z.object({
  name: z.string().min(1),
});

const messageSchema = z.object({
  message: z.string().min(1),
});

export const CHAT_PREFIX = '/chat/';
const CHAT_ROUTE = '';
const CHAT_DETAIL_ROUTE = ':id/';
const CHAT_MESSAGE_ROUTE = ':id/message/';

export function createChatApp(
  chatResource: IDatabaseResource<DBChat, DBCreateChat>,
  messageResource: IDatabaseResource<DBMessage, DBCreateMessage>,
) {
  const chatApp = new Hono<ContextVariables>();

  chatApp.post(CHAT_ROUTE, zValidator('json', chatSchema), async (ctx) => {
    const userId = ctx.get('userId');
    const { name } = await ctx.req.valid('json');
    const data = await chatResource.create({ name, ownerId: userId });
    ctx.get('cache').clearPath(ctx.req.path);
    return ctx.json({ data });
  });

  chatApp.get(CHAT_ROUTE, async (ctx) => {
    const userId = ctx.get('userId');
    const data = await chatResource.findAll({ ownerId: userId });
    const res = { data };
    ctx.get('cache').cache(res);
    return ctx.json({ data });
  });

  chatApp.get(CHAT_DETAIL_ROUTE, zValidator('param', idSchema), async (ctx) => {
    const { id: chatId } = ctx.req.valid('param');
    const data = await messageResource.find({ chatId });
    const res = { data };
    ctx.get('cache').cache(res);
    return ctx.json({ data });
  });

  chatApp.get(
    CHAT_MESSAGE_ROUTE,
    zValidator('param', idSchema),
    async (ctx) => {
      const { id: chatId } = ctx.req.valid('param');
      const data = await messageResource.findAll({ chatId });
      const res = { data };
      ctx.get('cache').cache(res);
      return ctx.json({ data });
    },
  );

  chatApp.post(
    CHAT_MESSAGE_ROUTE,
    zValidator('param', idSchema),
    zValidator('json', messageSchema),
    async (ctx) => {
      const { id: chatId } = ctx.req.valid('param');
      const { message } = ctx.req.valid('json');

      const userMessage: DBCreateMessage = { message, chatId, type: 'user' };
      await messageResource.create(userMessage);

      const allMessage = await messageResource.findAll({ chatId });
      const response = await generateMessageResponse(allMessage);

      const responseMessage: DBCreateMessage = {
        message: response,
        chatId,
        type: 'user',
      };

      const data = await messageResource.create(responseMessage);
      ctx.get('cache').clearPath(ctx.req.path);
      return ctx.json({ data });
    },
  );

  return chatApp;
}
