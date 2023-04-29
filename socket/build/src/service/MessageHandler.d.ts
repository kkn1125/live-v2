import uWS, { TemplatedApp } from "uWebSockets.js";
export default function messageHandler(app: TemplatedApp, ws: uWS.WebSocket<unknown>, message: ArrayBuffer, isBinary: boolean): void;
