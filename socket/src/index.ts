/* A quite detailed WebSockets upgrade example "async" */

import uWS from "uWebSockets.js";
import messageHandler from "./service/MessageHandler";
import { PORT } from "./util/global";
import { dev, TEMP_PATH } from "./util/tool";
import * as protobufjs from "protobufjs";
import { v4 } from "uuid";
import { manager } from "./model/Manager";
import fs from "fs";
import path from "path";

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
  if (fields[index] in (Message.$type?.fields || {})) continue;
  switch (fields[index]) {
    case "id":
      Field.d(
        Number(index),
        "float",
        "optional"
      )(Message.prototype, fields[index]);
      break;
    case "type":
    case "action":
    case "data":
    case "file":
    case "result":
      Field.d(
        Number(index),
        "string",
        "optional"
      )(Message.prototype, fields[index]);
      break;
    case "client":
    case "server":
      Field.d(
        Number(index),
        "bool",
        "optional"
      )(Message.prototype, fields[index]);
      break;
    default:
      break;
  }
}

const app = uWS
  .App({})
  .ws("/*", {
    /* Options */
    compression: uWS.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 32,
    /* Handlers */
    upgrade: (res, req, context) => {
      dev.log(
        "An Http connection wants to become WebSocket, URL: " +
          req.getUrl() +
          "!"
      );

      /* Keep track of abortions */
      const upgradeAborted = { aborted: false };

      /* You MUST copy data out of req here, as req is only valid within this immediate callback */
      const url = req.getUrl();
      const queries = Object.fromEntries(
        decodeURIComponent(req.getQuery().slice(2))
          .split("&")
          .map((query) => query.split("="))
      );
      const secWebSocketKey = req.getHeader("sec-websocket-key");
      const secWebSocketProtocol = req.getHeader("sec-websocket-protocol");
      const secWebSocketExtensions = req.getHeader("sec-websocket-extensions");

      /* Simulate doing "async" work before upgrading */
      setTimeout(() => {
        console.log(
          "We are now done with our async task, let's upgrade the WebSocket!"
        );

        if (upgradeAborted.aborted) {
          console.log("Ouch! Client disconnected before we could upgrade it!");
          /* You must not upgrade now */
          return;
        }

        /* This immediately calls open handler, you must not use res after this call */
        res.upgrade(
          {
            url: url,
            ...{ ...queries, userId: v4() },
          },
          /* Use our copies here */
          secWebSocketKey,
          secWebSocketProtocol,
          secWebSocketExtensions,
          context
        );
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
      ws.subscribe((ws as any).userId);
      /* 유저 생성 */
      manager.users.insert((ws as any).userId);
      console.log("A WebSocket connected with URL: " + (ws as any).url);
    },
    message: (ws, message, isBinary) => {
      /* Ok is false if backpressure was built up, wait for drain */
      messageHandler(app, ws, message, isBinary);
    },
    drain: (ws) => {
      console.log("WebSocket backpressure: " + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      console.log("WebSocket closed");
      const room = manager.rooms.findOneUserIn((ws as any).userId);
      if (room) {
        manager.out(room.id, (ws as any).userId);
      }
      manager.users.delete((ws as any).userId);
    },
  })
  .get("/hls/*", (res, req) => {
    const query = req.getQuery();
    const queryObj = Object.fromEntries(
      query.split("&").map((q) => q.split("="))
    );
    console.log(queryObj);
    const room = manager.rooms.findOneUserIn(queryObj.userId);

    try {
      const file = fs.readFileSync(
        path.join(
          path.resolve(),
          "tmp",
          "41322d81-65f9-4220-8fc8-54ad0f3f3092",
          queryObj.chunkIndex + ".webm"
        )
      );

      res.end(file);
    } catch (error) {
      res.end(undefined);
    }
  })
  .listen(PORT, (token) => {
    if (token) {
      console.log("Listening to port " + PORT);
    } else {
      console.log("Failed to listen to port " + PORT);
    }
  });

setInterval(() => {
  // console.log("manager", JSON.stringify(manager, null, 2));
  console.log("manager", manager);
  manager.clearEmpty();
}, 5000);
