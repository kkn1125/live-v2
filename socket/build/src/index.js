"use strict";
/* A quite detailed WebSockets upgrade example "async" */
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
const uWebSockets_js_1 = __importDefault(require("uWebSockets.js"));
const MessageHandler_1 = __importDefault(require("./service/MessageHandler"));
const global_1 = require("./util/global");
const tool_1 = require("./util/tool");
const protobufjs = __importStar(require("protobufjs"));
const uuid_1 = require("uuid");
const Manager_1 = require("./model/Manager");
const { Field, Message } = protobufjs;
const fields = [
    "id",
    "type",
    "action",
    "data",
    "file",
    "result",
    "client",
    "server",
];
for (let index in fields) {
    if (fields[index] in (Message.$type?.fields || {}))
        continue;
    switch (fields[index]) {
        case "id":
            Field.d(Number(index), "float", "optional")(Message.prototype, fields[index]);
            break;
        case "type":
        case "action":
        case "data":
        case "file":
        case "result":
            Field.d(Number(index), "string", "optional")(Message.prototype, fields[index]);
            break;
        case "client":
        case "server":
            Field.d(Number(index), "bool", "optional")(Message.prototype, fields[index]);
            break;
        default:
            break;
    }
}
const app = uWebSockets_js_1.default
    .App({})
    .ws("/*", {
    /* Options */
    compression: uWebSockets_js_1.default.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 32,
    /* Handlers */
    upgrade: (res, req, context) => {
        tool_1.dev.log("An Http connection wants to become WebSocket, URL: " +
            req.getUrl() +
            "!");
        /* Keep track of abortions */
        const upgradeAborted = { aborted: false };
        /* You MUST copy data out of req here, as req is only valid within this immediate callback */
        const url = req.getUrl();
        const queries = Object.fromEntries(decodeURIComponent(req.getQuery().slice(2))
            .split("&")
            .map((query) => query.split("=")));
        const secWebSocketKey = req.getHeader("sec-websocket-key");
        const secWebSocketProtocol = req.getHeader("sec-websocket-protocol");
        const secWebSocketExtensions = req.getHeader("sec-websocket-extensions");
        /* Simulate doing "async" work before upgrading */
        setTimeout(() => {
            console.log("We are now done with our async task, let's upgrade the WebSocket!");
            if (upgradeAborted.aborted) {
                console.log("Ouch! Client disconnected before we could upgrade it!");
                /* You must not upgrade now */
                return;
            }
            /* This immediately calls open handler, you must not use res after this call */
            res.upgrade({
                url: url,
                ...{ ...queries, userId: (0, uuid_1.v4)() },
            }, 
            /* Use our copies here */
            secWebSocketKey, secWebSocketProtocol, secWebSocketExtensions, context);
        }, 1000);
        /* You MUST register an abort handler to know if the upgrade was aborted by peer */
        res.onAborted(() => {
            /* We can simply signal that we were aborted */
            upgradeAborted.aborted = true;
        });
    },
    open: (ws) => {
        ws.subscribe("global");
        // ws.subscribe((ws as any).roomId);
        ws.subscribe(ws.userId);
        /* 유저 생성 */
        Manager_1.manager.users.insert(ws.userId);
        console.log("A WebSocket connected with URL: " + ws.url);
    },
    message: (ws, message, isBinary) => {
        /* Ok is false if backpressure was built up, wait for drain */
        (0, MessageHandler_1.default)(app, ws, message, isBinary);
    },
    drain: (ws) => {
        console.log("WebSocket backpressure: " + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
        console.log("WebSocket closed");
        const room = Manager_1.manager.findRoomUserIn(ws.userId);
        if (room) {
            Manager_1.manager.out(room.id, ws.userId);
        }
        Manager_1.manager.users.delete(ws.userId);
    },
})
    .listen(global_1.PORT, (token) => {
    if (token) {
        console.log("Listening to port " + global_1.PORT);
    }
    else {
        console.log("Failed to listen to port " + global_1.PORT);
    }
});
setInterval(() => {
    // console.log("manager", JSON.stringify(manager, null, 2));
    console.log("manager", Manager_1.manager);
    Manager_1.manager.clearEmpty();
}, 5000);
