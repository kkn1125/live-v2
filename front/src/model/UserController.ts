import { SIGNAL } from "../util/global";
import LiveSocket from "./LiveSocket";
import User from "./User";

export default class UserController {
  #socket: LiveSocket;

  constructor(socket: LiveSocket) {
    this.#socket = socket;
  }

  /* user create when socket connected */

  update(user: { [k in keyof User]?: User[keyof User] }) {
    this.#socket.sendBinary(SIGNAL.USER, "update", user);
  }
}
