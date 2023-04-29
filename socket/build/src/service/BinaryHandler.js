"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const protobufjs = __importStar(require("protobufjs"));
const Manager_1 = require("../model/Manager");
const Publisher_1 = __importDefault(require("../model/Publisher"));
const User_1 = __importDefault(require("../model/User"));
const fs_1 = __importDefault(require("fs"));
const tool_1 = require("../util/tool");
const { Message } = protobufjs;
const publisher = new Publisher_1.default(true);
let chunkUploadCount = 0;
function binaryHandler(app, ws, message) {
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
            }
            else if (base.action === "send/link") {
                console.log("🔗🔗🔗🔗🚀🚀🚀", base);
                const room = Manager_1.manager.rooms.findOneUserIn(ws.userId);
                const link = base.data.link;
                const desc = base.data.desc;
                room.setLink(link);
                room.setLinkDesc(desc);
                publisher.manager.sendMe(ws, { ...base }, { room, link, desc });
                publisher.manager.sendOther(ws, room.id, { ...base }, { room, link, desc });
            }
            else if (base.action === "fetch") {
                const rooms = Manager_1.manager.rooms.findAll();
                publisher.manager.sendMe(ws, base, { rooms });
            }
            else if (base.action === "like") {
                const user = Manager_1.manager.users.findOne(ws.userId);
                const room = Manager_1.manager.rooms.findOneUserIn(user.id);
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
            else if (base.action === "find") {
                const room = Manager_1.manager.rooms.findOne(base.data.roomId);
                if (room) {
                    const link = room.link;
                    const desc = room.linkDesc;
                    publisher.manager.sendMe(ws, base, { room, link, desc });
                }
            }
            else if (base.action === "create") {
                const room = Manager_1.manager.rooms.insert(base.data.roomId);
                const user = Manager_1.manager.users.findOne(ws.userId);
                ws.subscribe(room.id);
                if (base.data.roomTitle) {
                    room.setTitle(base.data.roomTitle);
                }
                room.join(user);
                const rooms = Manager_1.manager.rooms.findAll();
                fs_1.default.mkdir((0, tool_1.TEMP_PATH)(room), { recursive: true }, function (err) {
                    const wrtStream = fs_1.default.createWriteStream((0, tool_1.TEMP_PATH)(room) + "/readme.md");
                    wrtStream.write("# 테스트 영상");
                    wrtStream.write("\n\n");
                    wrtStream.write(`## ${room.id}`);
                    wrtStream.write("\n\n");
                    wrtStream.write(`admin: ${ws.userId}`);
                    wrtStream.write("\n");
                    wrtStream.write(`created_at: ${new Date(room.createdAt).toLocaleString("ko")}`);
                    wrtStream.end();
                });
                publisher.manager.publish(app, ws, base, { rooms });
            }
            else if (base.action === "update") {
                const room = Manager_1.manager.rooms.update(base.data.roomId, base.data);
                const rooms = Manager_1.manager.rooms.findAll();
                publisher.manager.publish(app, ws, base, { room, rooms });
            }
            else if (base.action === "update/join") {
                const room = Manager_1.manager.rooms.findOne(base.data.roomId);
                if (room) {
                    ws.subscribe(room.id);
                    const user = Manager_1.manager.users.findOne(ws.userId);
                    room.join(user);
                    publisher.manager.publishBinaryTo(app, ws, room.id, base, { room });
                }
            }
            else if (base.action === "update/out") {
                const room = Manager_1.manager.rooms.findOneUserIn(ws.userId);
                if (room) {
                    ws.unsubscribe(room.id);
                    Manager_1.manager.out(room.id, ws.userId);
                    publisher.manager.publishBinaryTo(app, ws, room.id, base, { room });
                }
            }
            else if (base.action === "delete") {
                const room = Manager_1.manager.rooms.delete(base.data.roomId);
                const rooms = Manager_1.manager.rooms.findAll();
                publisher.manager.publish(app, ws, base, {
                    rooms,
                    roomId: base.data.roomId,
                });
            }
            break;
        case "SIGNAL/USER":
            if (base.action === "send") {
                publisher.manager.sendMe(ws, base);
            }
            else if (base.action === "fetch") {
                publisher.manager.sendMe(ws, base);
            }
            else if (base.action === "find") {
                publisher.manager.sendMe(ws, base);
            }
            else if (base.action === "create") {
                Manager_1.manager.users.insert(base.data.userId);
                const user = new User_1.default(ws.userId);
                const room = Manager_1.manager.rooms.findOne(base.data.roomId);
                ws.subscribe(room.id);
                room.join(new User_1.default(ws.userId));
                publisher.manager.sendMe(ws, base, { room, user });
            }
            else if (base.action === "update") {
                console.log("update userid", ws.userId);
                const room = Manager_1.manager.rooms.findOneUserIn(ws.userId);
                if (room) {
                    const user = room.updateUser(ws.userId, base.data);
                    console.log(room, user);
                    const rooms = Manager_1.manager.rooms.findAll();
                    publisher.manager.publish(app, ws, base, { room, user, rooms });
                }
            }
            else if (base.action === "delete") {
                const room = Manager_1.manager.out(base.data.roomId, ws.userId);
                publisher.manager.publish(app, ws, base, {
                    room,
                    userId: ws.userId,
                });
            }
        case "SIGNAL/CHAT":
            if (base.action === "send") {
                const room = Manager_1.manager.rooms.findOneUserIn(ws.userId);
                if (room) {
                    publisher.manager.publishBinaryTo(app, ws, room.id, base, {
                        nickname: base.data.nickname,
                        content: base.data.content,
                        createdAt: +new Date(),
                    });
                }
                else {
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
                const room = Manager_1.manager.rooms.findOneUserIn(ws.userId);
                if (room) {
                    /* stream */
                    const stream = base.data.stream;
                    /* add stream */
                    room.addStream(base.data.stream);
                    /* file write stream */
                    // const filename = room.id + "-" + chunkUploadCount + ".webm";
                    // fs.writeFileSync(TEMP_PATH(room, filename), stream);
                    // chunkUploadCount++;
                    publisher.manager.sendMe(ws, base, {
                        stream,
                        streamPoint: room.streams.length,
                    });
                }
            }
            else if (base.action === "fetch") {
                const room = Manager_1.manager.rooms.findOneUserIn(ws.userId);
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
            }
            else if (base.action === "fetch/streams") {
                /* 미사용 영역 */
                const room = Manager_1.manager.rooms.findOneUserIn(ws.userId);
                if (room) {
                    const streams = room.streams;
                    const strStreams = streams.map((val) => new Uint8Array(val).toString());
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
exports.default = binaryHandler;
