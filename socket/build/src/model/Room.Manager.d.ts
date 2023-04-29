import ManagerImpl from "./ManagerImpl";
import Room from "./Room";
export default class RoomManager extends Array<Room> implements ManagerImpl<Room> {
    initialize(): void;
    findAll({ query, sort, }?: {
        query?: {
            [k in keyof Room]?: Room[keyof Room];
        };
        sort?: {
            [k in keyof Room]?: "asc" | "desc" | "ASC" | "DESC";
        };
    }): Room[];
    findOne(id: string): Room;
    findOneUserIn(userId: string): Room;
    findOneIndex(id: string): number;
    insert(id: string): Room;
    update(id: string, newRoom: Object): Room;
    delete(id: string): boolean;
    findUser(userId: string): import("./User").default;
    findEmpty(): Room[];
    clearEmpty(): void;
}
