"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Room_1 = __importDefault(require("./Room"));
class RoomManager extends Array {
    initialize() {
        this.splice(0, this.length);
        console.log("initialize", this);
    }
    findAll({ query, sort, } = {}) {
        let temp = this.slice(0);
        if (query) {
            const entries = Object.entries(query);
            temp = this.filter((room) => entries.find((q) => new RegExp(String(q[1]), "g").test(room[q[0]])));
        }
        if (sort) {
            const [key, ordering] = Object.entries(sort)[0];
            const order = ordering.toLowerCase() === "asc";
            temp = temp.sort((beforeRoom, afterRoom) => {
                return (order ? beforeRoom : afterRoom)[key].localeCompare((order ? afterRoom : beforeRoom)[key]);
            });
        }
        return temp;
    }
    findOne(id) {
        return this.find((room) => room.id === id);
    }
    findOneUserIn(userId) {
        const room = this.find((room) => room.findUser(userId));
        return room;
    }
    findOneIndex(id) {
        return this.findIndex((room) => room.id === id);
    }
    insert(id) {
        const room = new Room_1.default(id);
        this.push(room);
        return room;
    }
    update(id, newRoom) {
        const room = this.findOne(id);
        if (room) {
            Object.assign(room, newRoom);
            // console.log("room update", room);
        }
        return room;
    }
    delete(id) {
        const index = this.findOneIndex(id);
        if (index > -1) {
            const deletedRoom = this.splice(index, 1)[0];
            // console.log("room delete", deletedRoom);
            return true;
        }
        return false;
    }
    findUser(userId) {
        let temp = undefined;
        for (let room of this) {
            if (room.hasUser(userId)) {
                temp = room.findUser(userId);
                break;
            }
        }
        return temp;
    }
    findEmpty() {
        return this.findAll().filter((room) => room.isEmpty());
    }
    clearEmpty() {
        this.findEmpty().forEach((room) => {
            this.delete(room.id);
        });
    }
}
exports.default = RoomManager;
