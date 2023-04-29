import uWS, { TemplatedApp } from "uWebSockets.js";
export default function binaryHandler(app: TemplatedApp, ws: uWS.WebSocket<unknown>, message: ArrayBuffer): void;
