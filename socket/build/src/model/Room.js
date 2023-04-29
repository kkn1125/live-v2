"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Room {
    /* room info */
    id;
    title = "";
    desc = "";
    category = "";
    tags = [];
    streams = [];
    link = "";
    linkDesc = "";
    likes = [];
    views = 0;
    /* room users */
    admin;
    users = [];
    limit = 0;
    /* room log */
    createdAt;
    updatedAt;
    constructor(id) {
        id && (this.id = id);
        this.createdAt = +new Date();
        this.updatedAt = +new Date();
    }
    setAdmin(user) {
        if (this.admin) {
            this.admin.role = "viewer";
            console.log(`admin이 변경되었습니다. ${this.admin.nickname} => ${user.nickname}`);
        }
        this.admin = user;
        user.setRole("admin");
    }
    setLink(link) {
        this.link = link;
    }
    setLinkDesc(linkDesc) {
        this.linkDesc = linkDesc;
    }
    setTitle(title) {
        this.title = title;
    }
    findUser(userId) {
        const user = this.users.find((user) => user.id === userId);
        return user;
    }
    hasUser(userId) {
        return !!this.findUser(userId);
    }
    join(user) {
        user.involveRoomId = this.id;
        console.log("insert user");
        if (this.users.length === 0) {
            user.role = "admin";
            this.admin = user;
        }
        else {
            if (!this.admin) {
                user.role = "admin";
                this.admin = user;
            }
            user.role = "viewer";
        }
        this.users.push(user);
    }
    /* delete user */
    out(userId) {
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
    updateUser(userId, userData) {
        const user = this.findUser(userId);
        if (user) {
            Object.assign(user, userData);
        }
        return user;
    }
    updateRoom(roomData) {
        Object.assign(this, roomData);
        return this;
    }
    addStream(stream) {
        const buffer = new Uint8Array(stream.split(",").map((s) => Number(s)))
            .buffer;
        this.streams.push(buffer);
        console.log("add buffer", buffer);
    }
    getStream(index) {
        const stream = this.streams[index];
        const decode = new Uint8Array(stream).toString();
        return decode;
    }
    isEmpty() {
        return this.users.length === 0;
    }
    addLike(userId) {
        if (!this.likes.includes(userId)) {
            this.likes.push(userId);
            return true;
        }
        return false;
    }
}
exports.default = Room;
