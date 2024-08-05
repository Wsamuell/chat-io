import type { DBEntity } from '../models/db';
import type { IDatabaseResource } from './types';

/**
 * Note (sammy):
 * T extends S & DBEntity generics mean T must be a type that extends both S and DBEntity
 */
export class SimpleInMemoryResource<T extends S & DBEntity, S>
  implements IDatabaseResource<T, S>
{
  data: Array<T> = [];
  async create(data: S): Promise<T> {
    const fullData = {
      ...data,
      id: this.data.length,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as T;
    this.data.push(fullData);
    return fullData;
  }

  async update(id: string, data: Partial<S>): Promise<T | null> {
    const entity = await this.get(id);
    if (entity) {
      const newEntity = {
        ...entity,
        ...data,
        updatedAt: Date.now(),
      };
      await this.delete(id);
      this.data.push(newEntity);
      return newEntity;
    } else {
      return null;
    }
  }

  async get(id: string): Promise<T | null> {
    return this.data.find((item) => item.id === id) || null;
  }

  async find(data: Partial<T>): Promise<T | null> {
    return (
      this.data.find((item) => {
        for (const key in data) {
          if (data[key] != item[key]) return false;
        }
        return true;
      }) || null
    );
  }

  async findAll(data: Partial<T>): Promise<T[]> {
    const res = this.data.filter((item) => {
      for (const key in data) {
        if (data[key] !== item[key]) return false;
      }
      return true;
    });
    return res;
  }

  async delete(id: string): Promise<T | null> {
    const entity = this.data.find((item) => item.id === id);
    if (entity) {
      this.data = [...this.data.filter((item) => item.id !== entity.id)];
      return entity;
    } else return null;
  }
}
