"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class User {
    /* user info */
    id;
    nickname;
    involveRoomId;
    role;
    video = true;
    audio = true;
    likeRooms = [];
    /* user log */
    createdAt;
    updatedAt;
    constructor(id, nickname
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
    setNickname(nickname) {
        this.nickname = nickname;
    }
    setRole(role) {
        this.role = role;
    }
    addLikeRooms(roomId) {
        if (!this.likeRooms.includes(roomId)) {
            this.likeRooms.push(roomId);
            return true;
        }
        return false;
    }
}
exports.default = User;
