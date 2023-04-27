import User from "./User";

export type RoomUpdateType = {
  id?: string;
  title: string;
  desc: string;
  category: string;
  tags: string[];
  streams?: ArrayBuffer[];
  admin: User;
  users?: User[];
  limit: number;
  createdAt?: number;
  updatedAt?: number;
};

export default class Room {
  /* room info */
  id: string;
  title: string = "";
  desc: string = "";
  category: string = "";
  tags: string[] = [];
  streams: ArrayBuffer[] = [];
  link: string = "";

  /* room users */
  admin?: User;
  users: User[] = [];
  limit: number = 0;

  /* room log */
  createdAt: number;
  updatedAt: number;

  constructor(id: string) {
    id && (this.id = id);
    this.createdAt = +new Date();
    this.updatedAt = +new Date();
  }

  setLink(link: string) {
    this.link = link;
  }

  findUser(userId: string) {
    const user = this.users.find((user) => user.id === userId);
    return user;
  }

  hasUser(userId: string) {
    return !!this.findUser(userId);
  }

  join(user: User) {
    user.involveRoomId = this.id;

    if (this.users.length === 0) {
      user.role = "admin";
      this.admin = user;
    } else {
      if (!this.admin) {
        user.role = "admin";
        this.admin = user;
      }
      user.role = "viewer";
    }

    this.users.push(user);
  }

  /* delete user */
  out(userId: string) {
    const userIndex = this.users.findIndex((user) => user.id === userId);
    const deletedUser = this.users.splice(userIndex, 1)[0];
    console.log(this.users, userId, userIndex, deletedUser);
    if (this.admin) {
      console.log("어드민 있음");
      if (this.admin.id === userId) {
        console.log("어드민 같음");
        this.admin = undefined;
        console.log("어드민 지움");
      }
    }
    return deletedUser;
  }

  updateUser(userId: string, userData: User) {
    const user = this.findUser(userId);
    if (user) {
      Object.assign(user, userData);
    }
    return user;
  }

  updateRoom(roomData: Room) {
    Object.assign(this, roomData);
    return this;
  }

  addStream(stream: string) {
    const buffer = new Uint8Array(stream.split(",").map((s) => Number(s)))
      .buffer;
    this.streams.push(buffer);
    console.log("add buffer", buffer);
  }

  getStream(index: number) {
    const stream = this.streams[index];
    const decode = new Uint8Array(stream).toString();
    return decode;
  }

  isEmpty() {
    return this.users.length === 0;
  }
}
