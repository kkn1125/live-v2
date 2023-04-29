export type UserRole = "admin" | "viewer";
export default class User {
    id: string;
    nickname: string;
    involveRoomId: string;
    role: UserRole;
    video: boolean;
    audio: boolean;
    likeRooms: string[];
    createdAt: number;
    updatedAt: number;
    constructor(id: string, nickname?: string);
    setNickname(nickname: string): void;
    setRole(role: UserRole): void;
    addLikeRooms(roomId: string): boolean;
}
