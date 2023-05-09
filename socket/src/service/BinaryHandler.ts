import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import * as protobufjs from "protobufjs";
import uWS, { TemplatedApp } from "uWebSockets.js";
import { manager } from "../model/Manager";
import PublishManager from "../model/Publisher";
import User from "../model/User";
import { saveFilesAsEncode, TEMP_PATH } from "../util/tool";

const { Message } = protobufjs;

const publisher = new PublishManager(true);
let chunkUploadCount = 0;

export default async function binaryHandler(
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
        const room = manager.rooms.findOneUserIn((ws as any).userId);
        const link = base.data.link;
        const desc = base.data.desc;
        room.setLink(link, desc);
        publisher.manager.sendMe(ws, { ...base }, { room });
        publisher.manager.sendOther(ws, room.id, { ...base }, { room });
      } else if (base.action === "fetch") {
        const rooms = manager.rooms.findAll();
        publisher.manager.sendMe(ws, base, { rooms });
      } else if (base.action === "like") {
        const user = manager.users.findOne((ws as any).userId);
        const room = manager.rooms.findOneUserIn(user.id);
        if (room) {
          const likes = room.addLike(user.id);
          const wasLiked = user.addLikeRooms(room.id);
          const likeCounter = room.likes.length;
          publisher.manager.publishBinaryTo(app, ws, room.id, base, {
            room,
            likeCounter,
            likes,
            wasLiked,
          });
        }
      } else if (base.action === "find") {
        const room = manager.rooms.findOne(base.data.roomId);
        if (room) {
          publisher.manager.sendMe(ws, base, { room });
        }
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

        publisher.manager.publish(app, ws, base, { room, rooms });
      } else if (base.action === "update") {
        const room = manager.rooms.update(base.data.roomId, base.data);
        const rooms = manager.rooms.findAll();
        publisher.manager.publish(app, ws, base, { room, rooms });
      } else if (base.action === "join") {
        const room = manager.rooms.findOne(base.data.roomId);
        const user = manager.users.findOne((ws as any).userId);
        if (room) {
          ws.subscribe(room.id);
          room.join(user);
          publisher.manager.publishBinaryTo(app, ws, room.id, base, { room });
        }
      } else if (base.action === "out") {
        const roomId = base.data.roomId;
        const room = manager.rooms.findOne(roomId);

        if (room) {
          if (room.findUser((ws as any).userId)) {
            manager.out(room.id, (ws as any).userId);

            publisher.manager.publishBinaryTo(app, ws, room.id, base, {
              room,
            });
            ws.unsubscribe(room.id);
          }
        }
      } else if (base.action === "out/target") {
        const roomId = base.data.roomId;
        const userId = base.data.userId;

        const room = manager.rooms.findOne(roomId);
        const user = manager.users.findOne(userId);

        manager.out(room.id, user.id);

        publisher.manager.publishBinaryTo(app, ws, room.id, base, {
          room,
          userId,
        });

        user.socket.unsubscribe(room.id);
      } else if (base.action === "delete") {
        const room = manager.rooms.delete(base.data.roomId);
        const rooms = manager.rooms.findAll();

        let temp = new Uint8Array();

        const startTime = +new Date();
        console.log("start convert base time", startTime);

        console.log("delete room!");

        /* 녹화 파일 인코딩 합본 프로세스 - 2023-05-09 19:02:38 */
        // const fileNames: string[] = [];
        // if (room) {
        //   console.log("collecting recording buffers...");
        //   // const stream = fs.createWriteStream(TEMP_PATH(room, "test.txt"));
        //   const convertTime = +new Date();
        //   console.log("start convert");
        //   for (let i = 0; i < room.streams.length; i++) {
        //     const filename = TEMP_PATH(room, "test-" + i + ".webm");
        //     const time = +new Date();
        //     fs.writeFileSync(filename, new Uint8Array(room.streams[i]));

        //     const gap = time - +new Date();
        //     console.log(
        //       `${filename} 저장 시: ${gap / 1000}초 소요 | 시작시간부터 ${
        //         (time - convertTime) / 1000
        //       }초 소요`
        //     );

        //     fileNames.push(filename);
        //   }

        //   const mergedVideo = ffmpeg();

        //   fileNames.forEach((name) => {
        //     console.log("file add:", name);
        //     mergedVideo.addInput(name);
        //   });

        //   mergedVideo
        //     .mergeToFile(TEMP_PATH(room, "test.webm"), TEMP_PATH(room, ""))
        //     .on("error", () => {
        //       console.log("error!");
        //     })
        //     .on("end", () => {
        //       console.log("save buffer to file as webm!");
        //       const saveWebmTime = +new Date();
        //       console.log(
        //         `webm 저장 시점 ${(saveWebmTime - convertTime) / 1000}초 소요`
        //       );

        //       const convertVideo = ffmpeg();
        //       convertVideo
        //         .input(TEMP_PATH(room, "test.webm"))
        //         .output(TEMP_PATH(room, "video.mp4"))
        //         .on("end", () => {
        //           console.log("convert webm to mp4!");
        //           const saveMp4Time = +new Date();
        //           console.log(
        //             `webm 저장 시점 ${
        //               (saveMp4Time - convertTime) / 1000
        //             }초 소요`
        //           );

        //           const deleteStart = +new Date();
        //           fileNames.forEach((name) => {
        //             fs.unlinkSync(name);
        //           });
        //           const deleteEnd = +new Date();

        //           console.log(
        //             `개별 webm 삭제 시 총 ${
        //               (deleteEnd - deleteStart) / 1000
        //             }초 소요`
        //           );

        //           const deleteConcatWebm = +new Date();

        //           fs.unlinkSync(TEMP_PATH(room, "test.webm"));

        //           const deleteConcatWebmDone = +new Date();
        //           console.log(
        //             `합본 webm 삭제 시간 ${
        //               (deleteConcatWebmDone - deleteConcatWebm) / 1000
        //             }초 소요`
        //           );
        //           console.log(
        //             `최종 완료까지 ${
        //               (deleteConcatWebmDone - convertTime) / 1000
        //             }초 소요`
        //           );
        //         })
        //         .run();
        //     });

        //   // saveFilesAsEncode({ room, buffer: readFile, prefix: "stream" });
        // }

        publisher.manager.publish(app, ws, base, {
          room,
          rooms,
          roomId: base.data.roomId,
        });
      } else if (base.action === "delete/link") {
        const room = manager.rooms.findOneUserIn((ws as any).userId);
        const link = base.data.link;
        const desc = base.data.desc;
        room.deleteLink(link, desc);
        publisher.manager.publish(app, ws, base, { room });
      }
      break;
    case "SIGNAL/USER":
      if (base.action === "send") {
        publisher.manager.sendMe(ws, base);
      } else if (base.action === "fetch") {
        const user = manager.users.findOne((ws as any).userId);
        if (user) {
          publisher.manager.sendMe(ws, base, { user });
        }
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
        const room = manager.rooms.findOneUserIn((ws as any).userId);
        const user = manager.users.update((ws as any).userId, base.data);
        if (room) {
          // const user = room.updateUser((ws as any).userId, base.data);
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
            createdAt: base.data.createdAt,
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
          const buffer = room.addStream(base.data.stream);

          room.chunkUploadCount++;

          // const file = fs.readFileSync(TEMP_PATH(room, filename));
          // console.log("file!", file);

          publisher.manager.sendMe(ws, base, {
            stream,
            streamPoint: room.streams.length,
          });
        }
      } else if (base.action === "fetch") {
        console.log("fetch 아닌가?", base.data.roomId);
        const room = manager.rooms.findOne(base.data.roomId);
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
