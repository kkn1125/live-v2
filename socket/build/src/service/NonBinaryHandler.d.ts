import uWS, { TemplatedApp } from "uWebSockets.js";
export default function nonBinaryHandler(app: TemplatedApp, ws: uWS.WebSocket<unknown>, message: ArrayBuffer): void;
