import uWS, { TemplatedApp } from "uWebSockets.js";
import binaryHandler from "./BinaryHandler";
import nonBinaryHandler from "./NonBinaryHandler";

export default function messageHandler(
  app: TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  message: ArrayBuffer,
  isBinary: boolean
) {
  const handler = isBinary ? binaryHandler : nonBinaryHandler;
  handler(app, ws, message);
}
