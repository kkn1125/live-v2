export type UserRole = "admin" | "viewer";

export default class User {
  /* user info */
  id: string;
  nickname: string;
  involveRoomId: string;
  role: UserRole;
  video: boolean = true;
  audio: boolean = true;

  /* user log */
  createdAt: number;
  updatedAt: number;

  constructor(
    id: string,
    nickname: string
    // involveRoomId: string,
    // role: UserRole
  ) {
    this.id = id;
    this.nickname = nickname;
    // this.involveRoomId = involveRoomId;
    // this.role = role;
    this.createdAt = +new Date();
    this.updatedAt = +new Date();
  }

  changeRole(role: UserRole) {
    this.role = role;
  }
}
