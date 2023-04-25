import Room, { RoomUpdateType } from "./Room";
import User from "./User";

export default class Manager {
  users: User[] = [];
  rooms: Room[] = [];

  constructor() {}

  findRooms() {
    return this.rooms;
  }

  findRoom(roomId: string) {
    const room = this.rooms.find((room) => room.id === roomId);
    return room;
  }

  createRoom(id: string) {
    const room = new Room(id);
    this.rooms.push(room);
    return room;
  }

  updateRoom(id: string, roomData: Room) {
    const room = this.findRoom(id);

    if (room) {
      room.updateRoom(roomData);
    }

    return room;
  }

  deleteRoom(roomId: string) {
    const roomIndex = this.rooms.findIndex((room) => room.id === roomId);
    const deletedRoom = this.rooms.splice(roomIndex, 1)[0];
    return deletedRoom;
  }

  findRoomUserIn(userId: string) {
    const room = this.rooms.find((room) => room.findUser(userId));
    return room;
  }

  findUser(userId: string) {
    let findUser: User | undefined = undefined;
    for (let room of this.rooms) {
      const user = room.users.find((user) => user.id === userId);
      if (user) {
        findUser = user;
        break;
      }
    }
    return findUser;
  }

  join(roomId: string, user: User) {
    const room = this.findRoom(roomId);
    if (room) {
      const hasUser = room.hasUser(user.id);
      if (!hasUser) {
        room.join(user);
      } else {
        console.log("already exists user in", room);
      }
    }
  }

  out(roomId: string, userId: string) {
    const room = this.findRoom(roomId);
    if (room) {
      room.out(userId);
      console.log(userId, " out room success, room is:", room);
    }
    if (room.users.length === 0) {
      this.deleteRoom(roomId);
      console.log("room is empty, this room delete!");
    }
    return room;
  }

  clearEmptyRoom() {
    this.rooms = this.rooms.filter((room) => {
      if (room.users.length === 0) {
        console.log("empty room delete", room);
        return false;
      }
      return true;
    });
  }
}

const manager = new Manager();

export { manager };
