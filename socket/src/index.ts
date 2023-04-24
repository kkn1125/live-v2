/* A quite detailed WebSockets upgrade example "async" */

import uWS from "uWebSockets.js";
import messageHandler from "./service/messageHandler";
import { PORT } from "./util/global";
import { dev } from "./util/tool";
import protobufjs from "protobufjs";

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
      const encodedURI = req.getQuery().slice(2);
      const decodedURI = decodeURIComponent(encodedURI);
      const parsingQueries = Object.fromEntries(
        decodedURI.split("&").map((query) => query.split("="))
      );
      dev.log(parsingQueries);
      /* Keep track of abortions */
      const upgradeAborted = { aborted: false };

      /* You MUST copy data out of req here, as req is only valid within this immediate callback */
      const url = req.getUrl();
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
            ...parsingQueries,
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
      (ws as any).roomId && ws.subscribe((ws as any).roomId);
      (ws as any).userId && ws.subscribe((ws as any).userId);
      console.log("A WebSocket connected with URL: " + (ws as any).url);
    },
    message: (ws, message, isBinary) => {
      /* Ok is false if backpressure was built up, wait for drain */
      console.log("message", message);
      messageHandler(isBinary, app, ws, message);
      // let ok = ws.send(message, isBinary);
    },
    drain: (ws) => {
      console.log("WebSocket backpressure: " + ws.getBufferedAmount());
    },
    close: (ws, code, message) => {
      console.log("WebSocket closed");
    },
  })
  .listen(PORT, (token) => {
    if (token) {
      console.log("Listening to port " + PORT);
    } else {
      console.log("Failed to listen to port " + PORT);
    }
  });
