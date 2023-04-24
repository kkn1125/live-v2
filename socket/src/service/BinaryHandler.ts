import { Message } from "protobufjs";
import uWS, { TemplatedApp } from "uWebSockets.js";
import { manager } from "../model/Manager";
import PublishManager from "../model/Publisher";
import User from "../model/User";

const publisher = new PublishManager(true);

export default function binaryHandler(
  app: TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  message: ArrayBuffer
) {
  const decoded = Message.decode(new Uint8Array(message)).toJSON();
  Object.assign(decoded, { data: JSON.parse(decoded.data) });

  console.log("binary data", decoded);

  const base = {
    type: decoded.type,
    action: decoded.action,
    data: decoded.data,
  };

  switch (base.type) {
    case "SIGNAL/ROOM":
      if (base.action === "send") {
        publisher.manager.sendMe(ws, base);
      } else if (base.action === "fetch") {
        const rooms = manager.findRooms();
        publisher.manager.sendMe(ws, base, { rooms });
      } else if (base.action === "find") {
        publisher.manager.sendMe(ws, base);
      } else if (base.action === "create") {
        const room = manager.createRoom(base.data.roomId);
        publisher.manager.publish(app, ws, base, { room });
      } else if (base.action === "update") {
        const room = manager.findRoom(base.data.roomId);
        room.updateRoom(base.data.roomData);
        publisher.manager.publish(app, ws, base, { room });
      } else if (base.action === "update/join") {
        const room = manager.findRoom(base.data.roomId);
        room.join(new User((ws as any).userId, base.data.nickname));
      } else if (base.action === "update/out") {
        const room = manager.findRoomUserIn((ws as any).userId);
        if (room) {
          manager.out(room.id, (ws as any).userId);
        }
      } else if (base.action === "delete") {
        publisher.manager.sendMe(ws, base);
      }
      break;
    case "SIGNAL/USER":
      if (base.action === "send") {
        publisher.manager.sendMe(ws, base);
      } else if (base.action === "fetch") {
        publisher.manager.sendMe(ws, base);
      } else if (base.action === "find") {
        publisher.manager.sendMe(ws, base);
      } else if (base.action === "create") {
        const user = new User((ws as any).userId);
        const room = manager.findRoom(base.data.roomId);
        room.join(new User((ws as any).userId));
        publisher.manager.sendMe(ws, base, { room, user });
      } else if (base.action === "update") {
        console.log("update userid", (ws as any).userId);
        const room = manager.findRoomUserIn((ws as any).userId);
        const user = room.updateUser((ws as any).userId, base.data.userData);
        console.log(room, user);
        publisher.manager.publish(app, ws, base, { room, user });
      } else if (base.action === "delete") {
        const room = manager.out(base.data.roomId, (ws as any).userId);
        publisher.manager.publish(app, ws, base, {
          room,
          userId: (ws as any).userId,
        });
      }
    case "SIGNAL/CHAT":
      publisher.manager.sendMe(ws, base);
      break;
    case "SIGNAL/STREAM":
      if (base.action === "send") {
        const room = manager.findRoomUserIn((ws as any).userId);
        if (room) {
          room.addStream(base.data.stream);
          publisher.manager.sendMe(ws, base);
        }
      } else if (base.action === "fetch") {
        const room = manager.findRoomUserIn((ws as any).userId);
        if (room) {
          const stream = room.getStream(base.data.chunkIndex);
          if (stream) {
            publisher.manager.sendMe(ws, base, { stream });
          }
        }
      } else if (base.action === "fetch/streams") {
        const room = manager.findRoomUserIn((ws as any).userId);
        if (room) {
          const streams = room.streams;
          const strStreams = streams.map((val) =>
            new Uint8Array(val).toString()
          );
          if (strStreams) {
            publisher.manager.sendMe(ws, base, { streams: strStreams });
          }
        }
      } /*  else if (base.action === "find") {
        publisher.manager.sendMe(ws, base);
      } else if (base.action === "create") {
        publisher.manager.sendMe(ws, base, { room, user });
      } else if (base.action === "update") {
        publisher.manager.publish(app, ws, base, { room, user });
      } else if (base.action === "delete") {
        publisher.manager.publish(app, ws, base, {
          room,
          userId: (ws as any).userId,
        });
      } */
      break;
  }
}
