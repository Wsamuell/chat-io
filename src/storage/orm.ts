import type { PrismaClient } from '@prisma/client';

import type {
  DBChat,
  DBCreateChat,
  DBCreateMessage,
  DBCreateUser,
  DBMessage,
  DBUser,
} from '../models/db';
import type { IDatabaseResource } from './types';

export class UserDBResource implements IDatabaseResource<DBUser, DBCreateUser> {
  prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: DBCreateUser): Promise<DBUser> {
    const user = await this.prisma.user.create({
      data: { ...data },
    });
    return user as DBUser;
  }

  async delete(id: string): Promise<DBUser | null> {
    const user = await this.prisma.user.delete({
      where: { id: id },
    });
    return user as DBUser;
  }

  async get(id: string): Promise<DBUser | null> {
    const user = await this.prisma.user.findFirst({
      where: { id: id },
    });
    return user as DBUser | null;
  }

  async find(data: Partial<DBUser>): Promise<DBUser | null> {
    const user = await this.prisma.user.findFirst({
      where: { ...data },
    });
    return user as DBUser | null;
  }

  async findAll(data: Partial<DBUser>): Promise<DBUser[]> {
    const user = await this.prisma.user.findMany({
      where: { ...data },
    });
    return user as DBUser[];
  }

  async update(
    id: string,
    data: Partial<DBCreateUser>,
  ): Promise<DBUser | null> {
    const updateUser = await this.prisma.user.update({
      where: { id },
      data,
    });
    return updateUser as DBUser | null;
  }
}

export class ChatDBResource implements IDatabaseResource<DBChat, DBCreateChat> {
  prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: DBCreateChat): Promise<DBChat> {
    const chat = await this.prisma.chat.create({
      data: { ...data },
    });
    return chat as DBChat;
  }

  async delete(id: string): Promise<DBChat | null> {
    const chat = await this.prisma.chat.delete({
      where: { id: id },
    });
    return chat as DBChat;
  }

  async get(id: string): Promise<DBChat | null> {
    const chat = await this.prisma.chat.findFirst({
      where: { id: id },
    });
    return chat as DBChat | null;
  }

  async find(data: Partial<DBChat>): Promise<DBChat | null> {
    const chat = await this.prisma.chat.findFirst({
      where: { ...data },
    });
    return chat as DBChat | null;
  }

  async findAll(data: Partial<DBChat>): Promise<DBChat[]> {
    const chat = await this.prisma.chat.findMany({
      where: { ...data },
    });
    return chat as DBChat[];
  }

  async update(
    id: string,
    data: Partial<DBCreateChat>,
  ): Promise<DBChat | null> {
    const updateChat = await this.prisma.chat.update({
      where: { id },
      data,
    });
    return updateChat as DBChat | null;
  }
}

export class MessageDBResource
  implements IDatabaseResource<DBMessage, DBCreateMessage>
{
  prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: DBCreateMessage): Promise<DBMessage> {
    const message = await this.prisma.message.create({
      data: { ...data },
    });
    return message as DBMessage;
  }

  async delete(id: string): Promise<DBMessage | null> {
    const message = await this.prisma.message.delete({
      where: { id: id },
    });
    return message as DBMessage;
  }

  async get(id: string): Promise<DBMessage | null> {
    const message = await this.prisma.message.findFirst({
      where: { id: id },
    });
    return message as DBMessage | null;
  }

  async find(data: Partial<DBMessage>): Promise<DBMessage | null> {
    const message = await this.prisma.message.findFirst({
      where: { ...data },
    });
    return message as DBMessage | null;
  }

  async findAll(data: Partial<DBMessage>): Promise<DBMessage[]> {
    const message = await this.prisma.message.findMany({
      where: { ...data },
    });
    return message as DBMessage[];
  }

  async update(
    id: string,
    data: Partial<DBCreateMessage>,
  ): Promise<DBMessage | null> {
    const updateMessage = await this.prisma.message.update({
      where: { id },
      data,
    });
    return updateMessage as DBMessage | null;
  }
}
