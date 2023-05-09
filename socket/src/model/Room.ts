import User from "./User";

type Link = {
  link: string;
  desc: string;
};

type Chat = {
  userId: string;
  content: string;
  createdAt: number;
};

export type RoomUpdateType = {
  id?: string;
  title: string;
  desc: string;
  category: string;
  tags: string[];
  streams?: ArrayBuffer[];

  links: Link[];
  likes: string[];
  views: number;

  chunkUploadCount: number;

  /* room users */
  admin: User;
  users?: User[];
  limit: number;

  /* room log */
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

  /* FEAT: 채팅 모든 내용 불러오려면 해당 기능 개발 필요 */
  chatLogs: Chat[] = [];

  links: Link[] = [];
  likes: string[] = [];
  views: number = 0;

  chunkUploadCount: number = 0;

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

  setAdmin(user: User) {
    if (this.admin) {
      this.admin.role = "viewer";
      console.log(
        `admin이 변경되었습니다. ${this.admin.nickname} => ${user.nickname}`
      );
    }
    this.admin = user;
    user.setRole("admin");
  }

  setLink(link: string, desc: string) {
    this.links.push({ link, desc });
  }

  deleteLink(link: string, desc: string) {
    const index = this.links.findIndex(
      (roomLink) => roomLink.link === link && roomLink.desc === desc
    );
    if (index > -1) {
      return this.links.splice(index, 1);
    }
    return undefined;
  }

  setTitle(title: string) {
    this.title = title;
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
    console.log("insert user");
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
    console.log("😥before update user:", userData);
    if (user) {
      Object.assign(user, { ...userData });
    }
    console.log("✨after update user:", userData);
    return user;
  }

  updateRoom(roomData: Room) {
    Object.assign(this, { ...roomData });
    return this;
  }

  addStream(stream: string) {
    const buffer = new Uint8Array(stream.split(",").map((s) => Number(s)));
    this.streams.push(buffer.buffer);
    // console.log("add buffer", buffer.buffer);
    return buffer;
  }

  getStream(index: number) {
    const stream = this.streams[index];
    const decode = new Uint8Array(stream).toString();
    return decode;
  }

  isEmpty() {
    return this.users.length === 0;
  }

  addLike(userId: string) {
    if (!this.likes.includes(userId)) {
      this.likes.push(userId);
      return true;
    }
    return false;
  }
}
