import uWS, { TemplatedApp } from "uWebSockets.js";
import PublishManager from "../model/Publisher";

const publisher = new PublishManager(false);

export default function nonBinaryHandler(
  app: TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  message: ArrayBuffer
) {
  const decoded = JSON.parse(new TextDecoder().decode(message));

  console.log("non binary", decoded);

  const base = {
    type: decoded.type,
    action: decoded.action,
    data: decoded.data,
  };

  publisher.manager.sendMe(ws, base);
}
