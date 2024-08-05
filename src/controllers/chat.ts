import { Hono } from 'hono';
import type { ContextVariables } from '../constant';
import type {
  DBChat,
  DBCreateChat,
  DBCreateMessage,
  DBMessage,
} from '../models/db';
import type { IDatabaseResource } from '../storage/types';

export const CHAT_PREFIX = '/chat/';
const CHAT_ROUTE = '';
const CHAT_MESSAGE_ROUTE = ':id/message/';

export function createChatApp(
  chatResource: IDatabaseResource<DBChat, DBCreateChat>,
  messageResource: IDatabaseResource<DBMessage, DBCreateMessage>,
) {
  const chatApp = new Hono<ContextVariables>();

  chatApp.post(CHAT_ROUTE, async (ctx) => {
    const userId = ctx.get('userId');
    const { name } = await ctx.req.json();
    const data = await chatResource.create({ name, ownerId: userId });
    return ctx.json({ data });
  });

  chatApp.get(CHAT_ROUTE, async (ctx) => {
    const userId = ctx.get('userId');
    const data = await chatResource.findAll({ ownerId: userId });
    return ctx.json({ data });
  });

  chatApp.get(CHAT_MESSAGE_ROUTE, async (ctx) => {
    const { id: chatId } = ctx.req.param();
    const data = await messageResource.findAll({ chatId });
    return ctx.json({ data });
  });

  chatApp.post(CHAT_MESSAGE_ROUTE, async (ctx) => {
    const { id: chatId } = ctx.req.param();
    const message = await ctx.req.json();

    const userMessage: DBCreateMessage = { message, chatId, type: 'user' };
    await messageResource.create(userMessage);

    const responseMessage: DBCreateMessage = {
      message: 'Going Stupid',
      chatId,
      type: 'system',
    };

    const data = await messageResource.create(responseMessage);
    return ctx.json({ data });
  });
  return chatApp;
}
