export default interface ManagerImpl<T> {
  findAll({
    query,
    sort,
  }: {
    query?: { [k in keyof T]?: keyof T };
    sort?: { [k in keyof T]?: "asc" | "desc" | "ASC" | "DESC" };
  }): T[];
  findOne(id: string): T | undefined;
  findOneIndex(id: string): number;
  insert(id: string): T;
  update(id: string, t: Object): T;
  delete(id: string): T | undefined;
  initialize(): void;
}
