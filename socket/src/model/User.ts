import uWS from "uWebSockets.js";

export type UserRole = "admin" | "viewer";

export default class User {
  /* user info */
  id: string;
  nickname: string;
  involveRoomId: string;
  role: UserRole;
  video: boolean = true;
  audio: boolean = true;

  socket?: uWS.WebSocket<unknown>;

  likeRooms: string[] = [];

  /* user log */
  createdAt: number;
  updatedAt: number;

  constructor(
    id: string,
    nickname?: string
    // involveRoomId: string,
    // role: UserRole
  ) {
    id && (this.id = id);
    nickname && (this.nickname = nickname);
    // this.involveRoomId = involveRoomId;
    // this.role = role;
    this.createdAt = +new Date();
    this.updatedAt = +new Date();
  }

  setNickname(nickname: string) {
    this.nickname = nickname;
  }

  setRole(role: UserRole) {
    this.role = role;
  }

  addLikeRooms(roomId: string) {
    if (!this.likeRooms.includes(roomId)) {
      this.likeRooms.push(roomId);
      return true;
    }
    return false;
  }
}
