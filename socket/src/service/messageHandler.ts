import uWS, { TemplatedApp } from "uWebSockets.js";
import handleBinary from "./BinaryHandler";
import handleNonBinary from "./NonBinaryHandler";

export default (
  isBinary: boolean,
  app: TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  message: ArrayBuffer
) => (isBinary ? handleBinary : handleNonBinary)(app, ws, message);
