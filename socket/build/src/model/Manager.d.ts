import Room from "./Room";
import RoomManager from "./Room.Manager";
import User from "./User";
import UserManager from "./User.Manager";
export default class Manager {
    users: UserManager;
    rooms: RoomManager;
    constructor();
    findRoomUserIn(userId: string): Room;
    findUser(userId: string): User;
    join(roomId: string, user: User): void;
    out(roomId: string, userId: string): Room;
    clearEmpty(): void;
    initialize(): void;
}
declare const manager: Manager;
export { manager };
