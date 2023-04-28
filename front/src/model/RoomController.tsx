import { SIGNAL } from "../util/global";
import LiveSocket from "./LiveSocket";

export default class RoomController {
  #socket: LiveSocket;
  constructor(socket: LiveSocket) {
    this.#socket = socket;
  }

  create(roomId: string, roomTitle: string) {
    this.#socket.sendBinary(SIGNAL.ROOM, "create", {
      roomId,
      roomTitle,
    });
  }

  // join(roomId: string) {
  //   this.#socket.sendBinary(SIGNAL.ROOM, "update/join", {
  //     roomId,
  //   });
  // }

  join(roomId: string) {
    this.#socket.sendBinary(SIGNAL.ROOM, "join", {
      roomId: roomId,
    });
  }

  out(roomId: string) {
    this.#socket.sendBinary(SIGNAL.ROOM, "out", {
      roomId: roomId,
    });
  }

  delete(roomId: string) {
    this.#socket.sendBinary(SIGNAL.ROOM, "delete", {
      roomId,
    });
  }
}
