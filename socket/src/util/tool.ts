import uWS, { TemplatedApp } from "uWebSockets.js";
import protobufjs from "protobufjs";

const { Message } = protobufjs;

const dev = function (this: Console) {
  let prefix = "";
  return Object.assign(
    Object.fromEntries(
      Object.entries(console).map(([k, v]) =>
        k === "memory"
          ? [k, v]
          : [
              k,
              (...args: any[]) => {
                v.call(this, prefix, ...args);
                prefix = "";
              },
            ]
      )
    ),
    { alias: (_prefix: string) => (prefix = _prefix) }
  );
}.call(console);

function encodeForBinary(data: any, result: any = {}) {
  const convert = Object.assign(
    { ...data },
    { data: JSON.stringify(data.data), result: JSON.stringify(result) }
  );
  return Message.encode(new Message(convert)).finish();
}

function encodeForNonBinary(data: any, result: any = {}) {
  return JSON.stringify(Object.assign({ ...data }, { result }));
}

function getEncoder(isBinary: boolean) {
  return isBinary ? encodeForBinary : encodeForNonBinary;
}

function sendMe(
  ws: uWS.WebSocket<unknown>,
  data: Object,
  isBinary: boolean = false
) {
  const encoder = getEncoder(isBinary);
  ws.send(encoder(data), isBinary);
}
function sendOther(
  topic: string,
  ws: uWS.WebSocket<unknown>,
  data: Object,
  isBinary: boolean = false
) {
  const encoder = getEncoder(isBinary);
  ws.publish(topic, encoder(data), isBinary);
}
function broadcast(
  app: TemplatedApp,
  ws: uWS.WebSocket<unknown>,
  data: Object,
  isBinary: boolean = false
) {
  const encoder = getEncoder(isBinary);
  app.publish("global", encoder(data), isBinary);
}

export {
  dev,
  encodeForBinary,
  encodeForNonBinary,
  sendMe,
  sendOther,
  broadcast,
};
