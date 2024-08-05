/**
 * Notes (sammy):
 *
 * S represents a data type that contains all the fields required to create an entity (value we are creating or updating)
 *
 *
 *T is the type with all the fields of a database entity (value that already exist in the db)
 */
export interface IDatabaseResource<T, S> {
  create(data: S): Promise<T>;
  update(id: string, data: Partial<S>): Promise<T | null>;
  get(id: string): Promise<T | null>;
  find(data: Partial<T>): Promise<T | null>;
  findAll(data: Partial<T>): Promise<T[]>;
  delete(id: string): Promise<T | null>;
}
