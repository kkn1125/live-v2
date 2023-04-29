"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("./User"));
class UserManager extends Array {
    initialize() {
        this.splice(0, this.length);
        console.log("initialize", this);
    }
    findAll({ query, sort, }) {
        let temp = this.slice(0);
        if (query) {
            const entries = Object.entries(query);
            temp = this.filter((user) => entries.find((q) => new RegExp(String(q[1]), "g").test(user[q[0]])));
        }
        if (sort) {
            const [key, ordering] = Object.entries(sort)[0];
            const order = ordering.toLowerCase() === "asc";
            temp = temp.sort((beforeUser, afterUser) => {
                return (order ? beforeUser : afterUser)[key].localeCompare((order ? afterUser : beforeUser)[key]);
            });
        }
        return temp;
    }
    findOne(id) {
        return this.find((user) => user.id === id);
    }
    findOneIndex(id) {
        return this.findIndex((user) => user.id === id);
    }
    insert(id) {
        const user = new User_1.default(id);
        this.push(user);
        return user;
    }
    update(id, newUser) {
        const user = this.find((user) => user.id === id);
        if (user) {
            Object.assign(user, newUser);
            // console.log("user update", user);
        }
        return user;
    }
    delete(id) {
        const index = this.findIndex((user) => user.id === id);
        if (index > -1) {
            const deletedUser = this.splice(index, 1)[0];
            // console.log("user delete", deletedUser);
            return true;
        }
        return false;
    }
}
exports.default = UserManager;
