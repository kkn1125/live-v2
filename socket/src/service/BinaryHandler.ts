import uWS, { TemplatedApp } from "uWebSockets.js";
import { Message } from "protobufjs";
import { broadcast, encodeForBinary, sendMe } from "../util/tool";

export default function handleBinary(
  app: TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  message: ArrayBuffer
) {
  console.log("binary");
  const decoded = Message.decode(new Uint8Array(message)).toJSON();
  Object.assign(decoded, { data: JSON.parse(decoded.data) });
  broadcast(app, ws, decoded, true);
}
