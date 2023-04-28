import { Message } from "protobufjs";
import uWS, { TemplatedApp } from "uWebSockets.js";
import { manager } from "../model/Manager";
import PublishManager from "../model/Publisher";
import User from "../model/User";
import fs from "fs";
import path from "path";
import { TEMP_PATH } from "../util/tool";

const publisher = new PublishManager(true);
let chunkUploadCount = 0;

export default function binaryHandler(
  app: TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  message: ArrayBuffer
) {
  const decoded = Message.decode(new Uint8Array(message)).toJSON();
  Object.assign(decoded, { data: JSON.parse(decoded.data) });

  // console.log("binary data", decoded);

  const base = {
    type: decoded.type,
    action: decoded.action,
    data: decoded.data,
  };

  switch (base.type) {
    case "SIGNAL/ROOM":
      if (base.action === "send") {
        publisher.manager.sendMe(ws, base);
      } else if (base.action === "send/link") {
        console.log("🔗🔗🔗🔗🚀🚀🚀", base);
        const room = manager.rooms.findOneUserIn((ws as any).userId);
        const link = base.data.link;
        const desc = base.data.desc;
        room.setLink(link);
        room.setLinkDesc(desc);
        publisher.manager.sendMe(ws, { ...base }, { room, link, desc });
        publisher.manager.sendOther(
          ws,
          room.id,
          { ...base },
          { room, link, desc }
        );
      } else if (base.action === "fetch") {
        const rooms = manager.rooms.findAll();
        publisher.manager.sendMe(ws, base, { rooms });
      } else if (base.action === "like") {
        const user = manager.users.findOne((ws as any).userId);
        const room = manager.rooms.findOneUserIn(user.id);
        const likes = room.addLike(user.id);
        const wasLiked = user.addLikeRooms(room.id);
        const likeCounter = room.likes.length;
        publisher.manager.publishBinaryTo(app, ws, room.id, base, {
          room,
          likeCounter,
          likes,
          wasLiked,
        });
      } else if (base.action === "find") {
        const room = manager.rooms.findOne(base.data.roomId);
        publisher.manager.sendMe(ws, base, { room });
      } else if (base.action === "create") {
        const room = manager.rooms.insert(base.data.roomId);
        const user = manager.users.findOne((ws as any).userId);
        ws.subscribe(room.id);

        if (base.data.roomTitle) {
          room.setTitle(base.data.roomTitle);
        }

        room.join(user);

        const rooms = manager.rooms.findAll();

        fs.mkdir(TEMP_PATH(room), { recursive: true }, function (err) {
          const wrtStream = fs.createWriteStream(
            TEMP_PATH(room) + "/readme.md"
          );

          wrtStream.write("# 테스트 영상");
          wrtStream.write("\n\n");
          wrtStream.write(`## ${room.id}`);
          wrtStream.write("\n\n");
          wrtStream.write(`admin: ${(ws as any).userId}`);
          wrtStream.write("\n");
          wrtStream.write(
            `created_at: ${new Date(room.createdAt).toLocaleString("ko")}`
          );

          wrtStream.end();
        });

        publisher.manager.publish(app, ws, base, { rooms });
      } else if (base.action === "update") {
        const room = manager.rooms.update(base.data.roomId, base.data.roomData);
        const rooms = manager.rooms.findAll();
        publisher.manager.publish(app, ws, base, { room, rooms });
      } else if (base.action === "update/join") {
        const room = manager.rooms.findOne(base.data.roomId);
        if (room) {
          ws.subscribe(room.id);
          const user = manager.users.findOne((ws as any).userId);
          room.join(user);
          publisher.manager.publishBinaryTo(app, ws, room.id, base, { room });
        }
      } else if (base.action === "update/out") {
        const room = manager.rooms.findOneUserIn((ws as any).userId);
        if (room) {
          ws.unsubscribe(room.id);
          manager.out(room.id, (ws as any).userId);
          publisher.manager.publishBinaryTo(app, ws, room.id, base, { room });
        }
      } else if (base.action === "delete") {
        const room = manager.rooms.delete(base.data.roomId);
        const rooms = manager.rooms.findAll();
        publisher.manager.publish(app, ws, base, {
          rooms,
          roomId: base.data.roomId,
        });
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
        manager.users.insert(base.data.userId);
        const user = new User((ws as any).userId);
        const room = manager.rooms.findOne(base.data.roomId);
        ws.subscribe(room.id);
        room.join(new User((ws as any).userId));
        publisher.manager.sendMe(ws, base, { room, user });
      } else if (base.action === "update") {
        console.log("update userid", (ws as any).userId);
        const room = manager.rooms.findOneUserIn((ws as any).userId);
        if (room) {
          const user = room.updateUser((ws as any).userId, base.data.userData);
          console.log(room, user);
          const rooms = manager.rooms.findAll();
          publisher.manager.publish(app, ws, base, { room, user, rooms });
        }
      } else if (base.action === "delete") {
        const room = manager.out(base.data.roomId, (ws as any).userId);
        publisher.manager.publish(app, ws, base, {
          room,
          userId: (ws as any).userId,
        });
      }
    case "SIGNAL/CHAT":
      if (base.action === "send") {
        const room = manager.rooms.findOneUserIn((ws as any).userId);
        if (room) {
          publisher.manager.publishBinaryTo(app, ws, room.id, base, {
            nickname: base.data.nickname,
            content: base.data.content,
            createdAt: +new Date(),
          });
        } else {
          publisher.manager.publishBinaryTo(app, ws, "global", base, {
            nickname: base.data.nickname,
            content: base.data.content,
            createdAt: +new Date(),
          });
        }
      }
      break;
    case "SIGNAL/STREAM":
      if (base.action === "send") {
        const room = manager.rooms.findOneUserIn((ws as any).userId);
        if (room) {
          /* stream */
          const stream = base.data.stream;
          /* add stream */
          room.addStream(base.data.stream);
          
          const filename = room.id + "-" + chunkUploadCount + ".webm";
          fs.writeFileSync(TEMP_PATH(room, filename), stream);
          chunkUploadCount++;

          publisher.manager.sendMe(ws, base, {
            stream,
            streamPoint: room.streams.length,
          });
        }
      } else if (base.action === "fetch") {
        const room = manager.rooms.findOneUserIn((ws as any).userId);
        if (room) {
          /* get stream */
          const stream = room.getStream(base.data.chunkIndex);
          if (stream) {
            publisher.manager.sendMe(ws, base, {
              stream,
              streamPoint: room.streams.length,
            });
          }
          /* get stream */
        }
      } else if (base.action === "fetch/streams") {
        /* 미사용 영역 */
        const room = manager.rooms.findOneUserIn((ws as any).userId);
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
