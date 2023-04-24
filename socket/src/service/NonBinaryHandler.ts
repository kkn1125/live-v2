import uWS, { TemplatedApp } from "uWebSockets.js";
import { encodeForBinary, encodeForNonBinary, sendMe } from "../util/tool";

export default function handleNonBinary(
  app: TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  message: ArrayBuffer
) {
  console.log("non-binary");
  const decoded = JSON.parse(new TextDecoder().decode(message));
  sendMe(ws, decoded);
}
