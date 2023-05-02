import Room, { RoomUpdateType } from "./Room";
import RoomManager from "./Room.Manager";
import User from "./User";
import UserManager from "./User.Manager";

export default class Manager {
  // users: User[] = [];
  // rooms: Room[] = [];
  users: UserManager = new UserManager();
  rooms: RoomManager = new RoomManager();

  constructor() {}

  /* room interface */
  // findRooms() {
  //   return this.rooms;
  // }

  // findRoom(roomId: string) {
  //   const room = this.rooms.findOne(roomId);
  //   return room;
  // }

  // insertRoom(id: string) {
  //   const room = new Room(id);
  //   this.rooms.push(room);
  //   return room;
  // }

  // updateRoom(id: string, roomData: Room) {
  //   const room = this.findRoom(id);

  //   if (room) {
  //     room.updateRoom(roomData);
  //   }

  //   return room;
  // }

  // deleteRoom(roomId: string) {
  //   const roomIndex = this.rooms.findOneIndex(roomId);
  //   const deletedRoom = this.rooms.splice(roomIndex, 1)[0];
  //   return deletedRoom;
  // }

  // findRoomUserIn(userId: string) {
  //   const room = this.rooms.find((room) => room.findUser(userId));
  //   return room;
  // }

  /* user interface */
  // findUser(userId: string) {
  //   let findUser: User | undefined = undefined;
  //   for (let room of this.rooms) {
  //     const user = room.users.find((user) => user.id === userId);
  //     if (user) {
  //       findUser = user;
  //       break;
  //     }
  //   }
  //   return findUser;
  // }

  join(roomId: string, user: User) {
    const room = this.rooms.findOne(roomId);
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
    const room = this.rooms.findOne(roomId);
    if (room) {
      room.out(userId);
      console.log(userId, " out room success, room is:", room);
    }
    if (room.users.length === 0) {
      this.rooms.delete(roomId);
      console.log("room is empty, this room delete!");
    }
    return room;
  }

  clearEmpty() {
    this.rooms.clearEmpty();
  }

  initialize() {
    // this.rooms = [];
    // this.users = [];
    this.rooms.initialize();
    this.users.initialize();
  }
}

const manager = new Manager();

export { manager };
