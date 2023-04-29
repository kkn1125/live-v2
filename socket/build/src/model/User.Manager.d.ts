import ManagerImpl from "./ManagerImpl";
import User from "./User";
export default class UserManager extends Array<User> implements ManagerImpl<User> {
    initialize(): void;
    findAll({ query, sort, }: {
        query?: {
            [k in keyof User]?: User[keyof User];
        };
        sort?: {
            [k in keyof User]?: "asc" | "desc" | "ASC" | "DESC";
        };
    }): User[];
    findOne(id: string): User;
    findOneIndex(id: string): number;
    insert(id: string): User;
    update(id: string, newUser: User): User;
    delete(id: string): boolean;
}
